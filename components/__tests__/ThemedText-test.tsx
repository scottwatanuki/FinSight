const renderer = require("react-test-renderer");
const { ThemedText } = require("../ThemedText");

it(`renders correctly`, () => {
    const tree = renderer
        .create(<ThemedText>Snapshot test!</ThemedText>)
        .toJSON();

    expect(tree).toMatchSnapshot();
});
