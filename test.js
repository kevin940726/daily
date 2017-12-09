const { URLSearchParams } = require('url');
const fetch = require('node-fetch');

const HOST = 'http://localhost:5000';

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
        actions: [{
          name: 'lunch-0',
          text: ':heavy_plus_sign:',
          type: 'button',
          value: 'lunch1',
        }],
      },
      {
        title: 'lunch2',
        callback_id: 'lunch-1',
        actions: [{
          name: 'lunch-1',
          text: ':heavy_plus_sign:',
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
          callback_id: 'lunch-1',
          user: {
            name: 'kaihao',
          },
          original_message: mockResponse,
        }),
      }),
    });

    const response = await mockRequest.then(res => res.json());

    expect(response.attachments[1].text).toBe('@kaihao');
    expect(response.attachments[1].actions[0].text).toBe(':heavy_plus_sign: 1');
  });

  it('should handle message button clicked with same user', async () => {
    const original_message = {...mockResponse};
    original_message.attachments[1].text = '@kaihao';

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
          callback_id: 'lunch-1',
          user: {
            name: 'kaihao',
          },
          original_message,
        }),
      }),
    });

    const response = await mockRequest.then(res => res.json());

    expect(response.attachments[1].text).toBe('');
    expect(response.attachments[1].actions[0].text).toBe(':heavy_plus_sign:');
  });

  it('should handle message button clicked with new user', async () => {
    const original_message = {...mockResponse};
    original_message.attachments[1].text = '@jack';

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
          callback_id: 'lunch-1',
          user: {
            name: 'kaihao',
          },
          original_message,
        }),
      }),
    });

    const response = await mockRequest.then(res => res.json());

    expect(response.attachments[1].text).toBe('@jack, @kaihao');
    expect(response.attachments[1].actions[0].text).toBe(':heavy_plus_sign: 2');
  });
});
