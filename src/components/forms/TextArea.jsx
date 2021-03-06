import React from 'react';
import Radium from 'radium';
import TextField from 'components/forms/TextField';
import settings from 'settings';

@Radium
export default class TextArea extends TextField {

  render() {
    return (
      <div style={[styles.base, this.props.style]}>
        <label style={[
          styles.label,
          this.state.value.length && styles.labelWithValue,
          this.state.focused && styles.focusedLabel
        ]}>
          {this.props.label}
        </label>
        <textarea
          placeholder={this.props.label}
          value={this.state.value}
          style={styles.input}
          type={this.props.type || 'text'}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          onChange={this.handleChange.bind(this)} />
        <hr style={styles.underline} />
        <hr style={styles.underlineHighlight} />
        <div style={styles.errorMessage}>{this.props.error}</div>
      </div>
    );
  }
}

const styles = {
  base: {
    fontSize: '16px',
    lineHeight: '24px',
    width: 256,
    height: 72,
    display: 'inline-block',
    position: 'relative',
    backgroundColor: 'transparent'
  },
  label: {
    display: 'none',
    position: 'absolute',
    lineHeight: '22px',
    opacity: 1,
    color: settings.grey,
    fontSize: '.8em',
    top: 15,
    left: 8
  },
  labelWithValue: {
    display: 'block'
  },
  focusedLabel: {
    color: settings.infoColor
  },
  input: {
    padding: '0 0 0 6px',
    position: 'relative',
    width: '100%',
    height: '100%',
    borderColor: 'transparent',
    outline: 'none',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    marginTop: 40,
    fontSize: 'inherit',
    color: settings.darkerGrey
  },
  underline: {
    position: 'absolute',
    borderColor: 'transparent',
    borderBottom: '1px solid ' + settings.grey,
    width: '100%',
    bottom: -50,
    height: 0,
    boxSizing: 'content-box'
  },
  underlineHighlight: {
    borderColor: 'transparent',
    borderBottomColor: settings.brandColor,
    width: 0, // somehow transition this to 100%
    height: 0,
    bottom: -3,
    borderBottomWidth: 2,
    position: 'absolute',
    boxSizing: 'content-box'
  },
  errorMessage: {
    position: 'absolute',
    fontSize: 12,
    bottom: -17,
    color: settings.dangerColor
  }
};
