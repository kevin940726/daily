const { jsxslack: jsx } = require('@speee-js/jsx-slack');
const {
  CHOOSE_STORE_ID,
  CHOOSE_STORE_SELECT,
  CHOOSE_STORE_BUTTON,
} = require('../constants');

const CreateDrink = () => jsx`
  <Blocks>
    <Section>
      Start a new order 
    </Section>
    <Actions blockId="${CHOOSE_STORE_ID}">
      <ExternalSelect
        name="choose-store"
        placeholder="Choose a store"
        actionId="${CHOOSE_STORE_SELECT}"
        ...${{
          minQueryLength: 0,
        }}
      />
      <Button value="new-store" actionId="${CHOOSE_STORE_BUTTON}">or submit a new store</Button>
    </Actions>
  </Blocks>
`;

module.exports = CreateDrink;
