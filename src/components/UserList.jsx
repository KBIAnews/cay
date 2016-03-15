import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import {userSelected, fetchCommentsByUser} from '../actions';

import UserRow from './UserRow';
import Heading from './Heading';
import Spinner from './Spinner';

import { Lang } from '../lang';

@connect(state => state.groups)
@Lang
@Radium
export default class UserList extends React.Component {

  static propTypes = {
    users: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      _id: PropTypes.string.idRequired
    }).isRequired).isRequired
  }

  getUser(user) {
    this.props.dispatch(userSelected(user));
    this.props.dispatch(fetchCommentsByUser(user._id));
  }
  setAsActiveHandler(index) {
    this.setState({activeUserIndex: index});
  }
  getUserList(users) {
    return users.map((user, i) => {
      return (
        <UserRow {...this.props}
          active={this.state.activeUserIndex === i ? true : false}
          setAsActive={this.setAsActiveHandler.bind(this)}
          activeIndex={i}
          user={user}
          onClick={this.getUser.bind(this)}
          key={i} />
      );
    });
  }

  render() {

    var noUsersMessage = (<p style={ styles.noUsers }>
      No users loaded yet,<br />
      create a filter on the left to load users.
    </p>);

    var userListContent = this.props.users.length ? this.getUserList(this.props.users) : noUsersMessage;

    return (
    <div style={ [ styles.base, this.props.style ] }>
      <div style={ styles.columnHeader }>
        <Heading size="medium">
          <span style={styles.groupHeader}>{ window.L.t('group') }</span> (106 { window.L.t('users')})
        </Heading>
      </div>

      {
        this.props.loadingQueryset ?
          <div style={ styles.loading }>
            <Spinner /> Loading...
          </div>
        :
          userListContent
      }

    </div>
    );
  }
}

const styles = {
  base: {
    paddingLeft: 20
  },
  columnHeader: {
    height: 50
  },
  groupHeader: {
    textTransform: 'capitalize'
  },
  card: {
    margin: 0,
    padding: 0
  },
  noUsers: {
    fontSize: '12pt',
    color: '#888',
    fontStyle: 'italic',
    paddingRight: 50
  },
  loading: {
    fontSize: '14pt',
    color: '#888',
    padding: '10px 0'
  }
};
