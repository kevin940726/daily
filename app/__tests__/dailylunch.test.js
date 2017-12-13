const { URLSearchParams } = require('url');
const fetch = require('node-fetch');
const { PORT, COUNT_EMOJI, MAIN_COLOR } = require('../constants');

const HOST = `http://localhost:${PORT}`;

const buildSearchParams = (json) => {
  const params = new URLSearchParams();

  Object.keys(json)
    .forEach((key) => {
      params.append(key, json[key]);
    });

  return params;
};

describe('/dailylunch', () => {
  const mockResponse = {
    response_type: 'in_channel',
    attachments: [
      {
        title: 'lunch1',
        callback_id: 'lunch-0',
        color: MAIN_COLOR,
        actions: [{
          name: 'lunch-0',
          text: COUNT_EMOJI,
          type: 'button',
          value: 'lunch1',
        }],
      },
      {
        title: 'lunch2',
        callback_id: 'lunch-1',
        color: MAIN_COLOR,
        actions: [{
          name: 'lunch-1',
          text: COUNT_EMOJI,
          type: 'button',
          value: 'lunch2',
        }],
      },
    ],
  };

  it('should get post data from slash command', async () => {
    const mockRequest = fetch(`${HOST}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildSearchParams({
        token: 'gIkuvaNzQIHg97ATvDxqgjtO',
        team_id: 'T0001',
        team_domain: 'example',
        enterprise_id: 'E0001',
        enterprise_name: 'Globular%20Construct%20Inc',
        channel_id: 'C2147483705',
        channel_name: 'test',
        user_id: 'U2147483697',
        user_name: 'Steve',
        command: '/dailylunch',
        text: 'lunch1\r\nlunch2',
        response_url: 'https://hooks.slack.com/commands/1234/5678',
        trigger_id: '13345224609.738474920.8088930838d88f008e0',
      }),
    });

    const response = await mockRequest.then(res => res.json());

    expect(response).toEqual(mockResponse);
  });

  it('should handle message button clicked', async () => {
    const mockRequest = fetch(`${HOST}/button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildSearchParams({
        payload: JSON.stringify({
          actions: [{
            name: 'lunch-1',
            type: 'button',
            value: 'lunch2',
          }],
          message_ts: `${Date.now()}-${Math.random()}`,
          callback_id: 'lunch-1',
          user: {
            id: 'kaihao',
            name: 'kaihao',
          },
          original_message: mockResponse,
        }),
      }),
    });

    const response = await mockRequest.then(res => res.json());

    expect(response.attachments[1].text).toBe('<@kaihao>');
    expect(response.attachments[1].actions[0].text).toBe(`${COUNT_EMOJI} 1`);
  });

  it('should handle message button clicked with same user', async () => {
    const originalMessage = { ...mockResponse };
    originalMessage.attachments[1].text = '<@kaihao>';

    const mockRequest = fetch(`${HOST}/button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildSearchParams({
        payload: JSON.stringify({
          actions: [{
            name: 'lunch-1',
            type: 'button',
            value: 'lunch2',
          }],
          message_ts: `${Date.now()}-${Math.random()}`,
          callback_id: 'lunch-1',
          user: {
            id: 'kaihao',
            name: 'kaihao',
          },
          original_message: originalMessage,
        }),
      }),
    });

    const response = await mockRequest.then(res => res.json());

    expect(response.attachments[1].text).toBe('');
    expect(response.attachments[1].actions[0].text).toBe(COUNT_EMOJI);
  });

  it('should handle message button clicked with new user', async () => {
    const originalMessage = { ...mockResponse };
    originalMessage.attachments[1].text = '<@jack>';

    const mockRequest = fetch(`${HOST}/button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildSearchParams({
        payload: JSON.stringify({
          actions: [{
            name: 'lunch-1',
            type: 'button',
            value: 'lunch2',
          }],
          message_ts: `${Date.now()}-${Math.random()}`,
          callback_id: 'lunch-1',
          user: {
            id: 'kaihao',
            name: 'kaihao',
          },
          original_message: originalMessage,
        }),
      }),
    });

    const response = await mockRequest.then(res => res.json());

    expect(response.attachments[1].text).toBe('<@jack>, <@kaihao>');
    expect(response.attachments[1].actions[0].text).toBe(`${COUNT_EMOJI} 2`);
  });

  it('should handle concurrent message button clicked with more than one user', async () => {
    const ts = `${Date.now()}-${Math.random()}`;
    const makeRequest = userID => fetch(`${HOST}/button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildSearchParams({
        payload: JSON.stringify({
          actions: [{
            name: 'lunch-1',
            type: 'button',
            value: 'lunch2',
          }],
          message_ts: ts,
          callback_id: 'lunch-1',
          user: {
            id: userID,
          },
          original_message: mockResponse,
        }),
      }),
    });

    const mockRequest1 = makeRequest('kaihao').then(res => res.json());
    const mockRequest2 = makeRequest('jack').then(res => res.json());

    const responses = await Promise.all([
      mockRequest1,
      mockRequest2,
    ]).then(res => res);

    const response = responses[
      responses
        .map(res => res.attachments[1].text.split(', ').length)
        .reduce((max, cur, index, arr) => (cur > arr[max] ? index : max), 0)
    ];

    const users = response.attachments[1].text.split(', ');

    expect(users).toEqual(expect.arrayContaining(['<@jack>', '<@kaihao>']));
    expect(response.attachments[1].actions[0].text).toBe(`${COUNT_EMOJI} 2`);
  });

  it('should handle concurrent message button clicked with more than one user in different buttons', async () => {
    const ts = `${Date.now()}-${Math.random()}`;
    const makeRequest = (userID, index) => fetch(`${HOST}/button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: buildSearchParams({
        payload: JSON.stringify({
          actions: [{
            name: `lunch-${index}`,
            type: 'button',
            value: `lunch${index + 1}`,
          }],
          message_ts: ts,
          callback_id: `lunch-${index}`,
          user: {
            id: userID,
          },
          original_message: mockResponse,
        }),
      }),
    });

    const mockRequest1 = makeRequest('kaihao', 0).then(res => res.json());
    const mockRequest2 = makeRequest('jack', 1).then(res => res.json());

    const responses = await Promise.all([
      mockRequest1,
      mockRequest2,
    ]).then(res => res);

    const response = responses[
      responses
        .map(res => res.attachments[1].text.split(', ').length)
        .reduce((max, cur, index, arr) => (cur > arr[max] ? index : max), 0)
    ];

    expect(response.attachments[0].text).toBe('<@kaihao>');
    expect(response.attachments[1].text).toBe('<@jack>');
  });
});
