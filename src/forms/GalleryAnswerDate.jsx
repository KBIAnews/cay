import React, {PropTypes} from 'react';
import Radium from 'radium';
import moment from 'moment';

@Radium
export default class GalleryAnswerDate extends React.Component {
  static propTypes = {
    answer: PropTypes.shape({
      edited: PropTypes.object,
      answer: PropTypes.shape({
        value: PropTypes.string.isRequired
      })
    }).isRequired
  }

  render() {
    const {answer} = this.props;
    const text = answer.edited ? answer.edited : answer.answer.value;

    return (
      <div>{moment(new Date(text)).format('D MMM YYYY')}</div>
    );
  }
}
