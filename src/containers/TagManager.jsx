import React from 'react';
import { connect } from 'react-redux';
import Radium from 'radium';

import Page from './Page';
import ContentHeader from '../components/ContentHeader';
import InPlaceEditor from '../components/forms/InPlaceEditor';

import settings from '../settings';

@connect(state => {
  return state.pipelines;
})
@Radium
export default class TagManager extends React.Component {

  componentWillMount() {
    this.setState({ tags: [ 'top_commenter', 'banned', 'moderator', 'martian', 'ufo' ] });
  }

  confirmDeletion(index) {
    var tagsCopy = this.state.tags.slice();
    tagsCopy.splice(index, 1);
    this.setState({ tags: tagsCopy });
  }

  tagAdderChangeHandler(event) {
    this.setState({ adderValue: event.target.value });
  }

  tagAdderClickHandler() {
    if (this.state.adderValue) {
      this.setState({ tags: [ ...this.state.tags, this.state.adderValue ] });
    }
  }

  render() {

    return (

      <Page>

        <ContentHeader title="Tag Manager" />

        <div style={ styles.tagAdder }>
          <input style={ styles.tagAdderInput } onChange={ this.tagAdderChangeHandler.bind(this) } type="text" placeholder="Add a new tag..." />
          <button style={ styles.tagAdderButton } onClick={ this.tagAdderClickHandler.bind(this) }>Add tag</button>
        </div>

        <table style={ styles.tableBase }>
          <thead>
            <tr>
              <th style={ [ styles.checkBoxHeader ] }><input type="checkbox" /></th>
              <th style={ [ styles.tableHeader ] }>Tag</th>
              <th style={ [ styles.tableHeader, styles.actionsHeader ] }></th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.tags.map((tag, i) => {
                return (
                  <tr key={ i }>
                    <td style={ [ styles.checkBoxColumn ] }>
                      <input type="checkbox" />
                    </td>
                    <td>
                      <InPlaceEditor initialValue={ tag } />
                    </td>
                    <td style={ styles.actionColumn }>
                      <button style={ [ styles.actionButtons, styles.danger ] } onClick={ this.confirmDeletion.bind(this, i) }>Delete</button>
                    </td>
                  </tr>
                );
              })
            }

          </tbody>
        </table>

      </Page>
    );
  }
}
const styles = {
  tableBase: {
    margin: '20px',
    width: '70%',
    maxWidth: '900px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    background: 'white',
    padding: '20px'
  },
  tableHeader: {
    textAlign: 'left',
    color: '#ccc',
  },
  actionsHeader: {
    width: '200px'
  },
  checkBoxColumn: {
    padding: '10px',
    textAlign: 'center'
  },
  checkBoxHeader: {
    padding: '10px',
    textAlign: 'center'
  },
  actionButtons: {
    border: '1px solid #ccc',
    padding: '10px',
    cursor: 'pointer',
    margin: '5px',
    background: 'none'
  },
  danger: {
    color: '#a00'
  },
  tagAdder: {
    width: '400px',
    margin: '20px'
  },
  tagAdderInput: {
    display: 'inline-block',
    padding: '0 10px',
    lineHeight: '40px',
    fontSize: '11pt',
    borderLeft: '1px solid #ccc',
    borderTop: '1px solid #ccc',
    borderBottom: '1px solid #ccc',
    borderRight: '0px'
  },
  tagAdderButton: {
    display: 'inline-block',
    padding: '0 10px',
    lineHeight: '38px',
    background: '#eee',
    margin: '0px',
    border: '1px solid #ccc',
    fontSize: '11pt',
    cursor: 'pointer'
  },
  actionColumn: {
    textAlign: 'right'
  }
};
