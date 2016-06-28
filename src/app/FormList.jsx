import React, { PropTypes } from 'react';
import Radium from 'radium';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import MdDelete from 'react-icons/lib/md/delete';
import _ from 'lodash';
import MdBuild from 'react-icons/lib/md/build';

import { deleteForm, fetchForms, updateFormStatus } from 'forms/FormActions';
import settings from 'settings';

import Page from 'app/layout/Page';
import Button from 'components/Button';
import ContentHeader from 'components/ContentHeader';
import Table from 'components/tables/Table';
import TableHead from 'components/tables/TableHead';
import TableHeader from 'components/tables/TableHeader';
import TableBody from 'components/tables/TableBody';
import TableRow from 'components/tables/TableRow';
import TableCell from 'components/tables/TableCell';
import Tab from 'components/tabs/Tab';
import Tabs from 'components/tabs/Tabs';

import ButtonGroup from 'components/ButtonGroup';

// Forms, Widgets, Submissions

@connect(({ forms }) => ({ forms }))
@Radium
export default class FormList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {displayMode: 'open'};
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  componentWillMount() {
    this.props.dispatch(fetchForms());
  }

  confirmDeletion(name, description, index, event) {
    event.stopPropagation();
    this.setState({
      confirmFormName: name,
      showConfirmDialog: true,
      formToDelete: [ name, description, index ]
    });
  }

  onConfirmClick() {
    var formToDelete = this.state.formToDelete;
    this.setState({ confirmFormName: '', showConfirmDialog: false, tagToDelete: null });
    this.props.dispatch(deleteForm(...formToDelete));
  }

  closeDialog() {
    this.setState({ confirmFormName: '', showConfirmDialog: false, formToDelete: null });
  }

  onRowClick(id) {
    const {router} = this.context;
    return router.push(`/forms/${id}/submissions`);
  }

  renderTable(group = []) {
    return (
      <Table style={styles.list} striped={ true } multiSelect={ false } hasActions={ true } isLoading={ this.props.loadingTags } loadingMessage="Loading...">
        <TableHead>
          <TableHeader>{ window.L.t('Name') }</TableHeader>
          <TableHeader>{ window.L.t('Description') }</TableHeader>
          <TableHeader>{ window.L.t('Submissions') }</TableHeader>
        </TableHead>
        <TableBody>
          {group.map(this.renderRow.bind(this))}
        </TableBody>
      </Table>
    );
  }

  renderRow(form, i) {
    const header = form.header || {};
    return (
      <TableRow onClick={this.onRowClick.bind(this, form.id)} style={styles.row} key={i}>
        <TableCell>{header.title}</TableCell>
        <TableCell style={{maxWidth: 400}}>{header.description}</TableCell>
        <TableCell>{form.stats.responses}</TableCell>
        <TableCell><MdDelete key={i} onClick={ this.confirmDeletion.bind(this, header.title, header.description, form.id) } /></TableCell>
      </TableRow>
    );
  }

  setDisplayMode(displayMode) {
    this.setState({displayMode});
  }

  render() {

    const forms = this.props.forms.formList.map(id => this.props.forms[id]);
    const visibleForms = forms.filter(form => form.status === this.state.displayMode);

    return (
      <Page>
        <ContentHeader title="View Forms" style={styles.header} subhead="Create, edit and view forms">
          <Link to="forms/create" style={styles.createButton}>
            <Button category="info">Create <MdBuild /></Button>
          </Link>
        </ContentHeader>

        <ButtonGroup initialActiveIndex={0} behavior="radio">
          <Button onClick={this.setDisplayMode.bind(this, 'open')}>Open</Button>
          <Button onClick={this.setDisplayMode.bind(this, 'closed')}>Closed</Button>
        </ButtonGroup>

        {this.renderTable(visibleForms)}

        {
          this.state.showConfirmDialog ?
          <div style={ styles.confirmOverlay }>
            <div style={ styles.confirmDialog }>
              <h2>Warning: this action has no undo.</h2>
              <p style={ styles.confirmMessage }>Are you sure you want to remove the form <strong style={ styles.strong }>"{ this.state.confirmFormName }"</strong>?</p>
              <button style={ [ styles.confirmButton, styles.yesButton ] } onClick={ this.onConfirmClick.bind(this) }>Yes</button>
              <button style={ [ styles.confirmButton, styles.noButton ] } onClick={ this.closeDialog.bind(this) }>No</button>
            </div>
          </div>
          : null
        }
      </Page>
    );
  }
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    borderBottom: '1px solid ' + settings.mediumGrey,
    marginBottom: 10
  },
  list: {
    width: '100%',
    border: 'none'
  },
  row: {
    cursor: 'pointer',
    borderBottom: '1px solid ' + settings.lightGrey,
    backgroundColor: 'white',
    ':hover': {
      backgroundColor: settings.lightGrey
    }
  },
  createButton: {
    marginTop: 10
  },
  confirmOverlay: {
    background: 'rgba(0,0,0,.7)',
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '5000'
  },
  confirmDialog: {
    width: '500px',
    background: 'white',
    padding: '30px 30px 110px 30px',
    margin: '50px auto',
    position: 'relative'
  },
  confirmMessage: {
    fontSize: '16px',
    marginTop: '20px'
  },
  confirmButton: {
    position: 'absolute',
    padding: '0 20px',
    lineHeight: '40px',
    border: 'none',
    background: '#ddd',
    cursor: 'pointer'
  },
  yesButton: {
    right: '30px',
    bottom: '30px',
    background: settings.brandColor,
    color: 'white'
  },
  noButton: {
    left: '30px',
    bottom: '30px'
  },
  tabs: {
    backgroundColor: 'white',
    marginTop: 20,
    clear: 'both'
  }
};
