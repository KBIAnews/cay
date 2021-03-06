import React, {PropTypes} from 'react';
import Radium from 'radium';

import Card from 'components/cards/Card';
import CardHeader from 'components/cards/CardHeader';

@Radium
export default class CommentCard extends React.Component {
  render() {
    return (
      <Card style={[styles.base, this.props.style]}>
        <CardHeader>User Name</CardHeader>
        <p>{this.props.body}</p>
      </Card>
    );
  }
}

const styles = {

};
