import * as React from "react";
import { StyleSheet, TextInput } from "react-native";

const BLUE = "#428AF8";
const LIGHT_GRAY = "#D3D3D3";

class MyTextInput extends React.Component {
  state = {
    isFocused: false
  };

  handleFocus = event => {
    this.setState({ isFocused: true });
    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };

  handleBlur = event => {
    this.setState({ isFocused: false });
    if (this.props.onBlur) {
      this.props.onBlur(event);
    }
  };

  render() {
    const { isFocused } = this.state;
    const { onFocus, onBlur, ...otherProps } = this.props;
    return (
      <TextInput
        selectionColor={BLUE}
        underlineColorAndroid={
          isFocused ? BLUE : LIGHT_GRAY
        }
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        style={styles.textInput}
        {...otherProps}
      />
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    height: 100,
    paddingLeft: 6,
    fontSize: 60
  }
});

export default MyTextInput;