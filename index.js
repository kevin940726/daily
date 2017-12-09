const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

const COUNT_EMOJI = ':heavy_plus_sign:';

app.use(bodyParser());

app.use(async (ctx, next) => {
  if (ctx.path !== '/create') {
    return await next();
  }

  console.log(ctx.request.body);

  const { text } = ctx.request.body;

  const lunches = text.split('\r\n')
    .map(lunch => lunch.trim())
    .filter(Boolean);

  ctx.body = {
    response_type: 'in_channel',
    attachments: lunches
      .map((lunch, index) => ({
        title: lunch,
        callback_id: `lunch-${index}`,
        actions: [{
          name: `lunch-${index}`,
          text: COUNT_EMOJI,
          type: 'button',
          value: lunch,
        }],
      })),
  };
});

app.use(async (ctx, next) => {
  if (ctx.path !== '/button') {
    return await next();
  }

  const body = JSON.parse(ctx.request.body.payload);

  console.log(body);

  const { callback_id, user, original_message } = body;

  ctx.body = {
    ...original_message,
    attachments: original_message.attachments
      .map((lunch, index) => {
        if (`lunch-${index}` !== callback_id) {
          return lunch;
        }

        const currentUser = `@${user.name}`;

        const users = new Set((lunch.text || '')
          .split(', ')
          .map(user => user.trim())
          .filter(Boolean)
        );

        if (users.has(currentUser)) {
          users.delete(currentUser);
        } else {
          users.add(currentUser);
        }
        
        return {
          ...lunch,
          text: Array.from(users)
            .join(', '),
          actions: [{
            ...lunch.actions[0],
            text: `${COUNT_EMOJI}${users.size ? ` ${users.size}` : ''}`,
          }],
        };
      }),
  };
});

app.listen(5000);
