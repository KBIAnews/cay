import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Button, Tabs, Tab, RadioGroup, Radio, Textfield } from 'react-mdl';

import Spinner from 'components/Spinner';

import CopyToClipboard from 'react-copy-to-clipboard';

import {
  updateForm,
  updateFormSettings
 } from 'forms/FormActions';

import FieldTypeButton from 'forms/FieldTypeButton';
import askTypes from 'forms/WidgetTypes';

import Modal from 'components/modal/Modal';

@connect(({ app, forms }) => ({ app, forms }))
export default class FormBuilderSidebar extends Component {

  constructor(props) {
    super(props)

    this.state = {
      openDialog: false,
      formStatus: 'closed',
      activeTab: 0
    }

    this.setActiveTab = this.setActiveTab.bind(this)
  }

  onPublishOptions() {
    this.setState({
      openDialog: !this.state.openDialog
    })
  }

  onFormStatusChange(e) {
    let status = e.target.value;
    this.setState({ formStatus: status });
    this.props.dispatch(updateForm({status}));
    this.props.dispatch(updateFormSettings({ isActive: status === 'open' }));
  }

  onInactiveMessageChange(e) {
    this.props.dispatch(updateFormSettings({ inactiveMessage: e.target.value }));
  }

  createEmbed(type) {
    const {forms, activeForm} = this.props;
    const form = activeForm ? forms[activeForm] : forms.form;
    if (!form) return;

    switch (type) {
    case 'script-tag':
      return `<div id="ask-form"></div><script src="${form.settings.baseUrl}${activeForm}.js"></script>`;
    case 'iframe':
      return `<iframe width="100%" height="580" src="${form.settings.baseUrl}${activeForm}.html"></iframe>`;
    case 'standalone':
      return `${form.settings.baseUrl}${activeForm}.html`;
    default:
      // nothing
    }
  }

  setActiveTab(tab) {
    this.setState({
      activeTab: tab
    })
  }

  render() {

    const { preview, onClosePreview, onOpenPreview, forms, activeForm, app, onSaveClick } = this.props;
    const form = activeForm ? forms[activeForm] : forms.form;
    const { activeTab } = this.state;

    return (
      <div style={styles.leftPan}>
        <div style={styles.leftContainer}>
          <h4 style={styles.leftContainerTitle}>Question Fields</h4>
          <div className="field-types" style={styles.typeList}>
            {askTypes.map((type, i) => (
              <FieldTypeButton key={ i } field={ type } />
            ))}
          </div>

          <div>
            <Button
              raised ripple
              onClick={onOpenPreview}
              style={{ width: 150, marginRight: 10 }}>
              Preview
            </Button>
            <Button
              style={{ width: 150 }}
              raised ripple accent
              onClick={onSaveClick}>
              { forms.savingForm ? <Spinner/> : null } Save
            </Button>

            {
              activeForm
              ? <Button
                  style={{ width: 310, marginTop: 10 }}
                  raised ripple accent
                  onClick={this.onPublishOptions.bind(this)}>
                  Publish options
                </Button>
              : null
            }

          </div>

          {
            activeForm ? (
            <Modal
              noFooter
              style={styles.publishModal}
              title="Publish Options"
              cancelAction={this.onPublishOptions.bind(this)}
              isOpen={this.state.openDialog}
            >
              <div style={ styles.dialogContent }>
                <div>
                  <h4 style={ styles.dialogSubTitle }>Set form status</h4>
                  <RadioGroup
                    onChange={ this.onFormStatusChange.bind(this) }
                    childContainer="div"
                    value={ form.status }
                    name="formStatusRadio">
                    <Radio value="open" ripple>Live, accepting submissions</Radio>
                    <Radio value="closed">Closed, not accepting submissions</Radio>
                  </RadioGroup>
                  {
                    this.state.formStatus && this.state.formStatus == 'closed'
                    ? <div>
                      <Textfield
                        onChange={this.onInactiveMessageChange.bind(this)}
                        label="We are not currently accepting submissions..."
                        value={form.settings.inactiveMessage}
                        style={{ width: '95%', marginLeft: '5%' }}
                      />
                      </div>
                    : null
                  }
                  <Button
                    raised ripple
                    style={{ marginTop: 20 }}
                    onClick={onSaveClick}>
                    { forms.savingForm ? <Spinner/> : null } Apply
                  </Button>
                </div>

                <div>
                  <h4 style={ styles.dialogSubTitle }>Embed options</h4>
                  <Tabs
                    activeTab={activeTab}
                    onChange={this.setActiveTab}
                  >
                    <Tab>With iframe</Tab>
                    <Tab>Without iframe</Tab>
                  </Tabs>
                  <section>
                    {
                      activeTab === 0 ?
                        <div>
                          <textarea className="embed-code-iframe" readOnly style={styles.embedCode} value={this.createEmbed('iframe')}/>
                          <CopyToClipboard
                            text={this.createEmbed('iframe')}
                            onCopy={() => {
                              this.setState({embedCopied: true});
                              setTimeout(() => this.setState({embedCopied: false}), 5000);
                            }}>
                            <Button raised>Copy</Button>
                          </CopyToClipboard>
                          {
                            this.state.embedCopied
                              ? <span style={ styles.copied }>Copied!</span>
                              : null
                          }
                        </div>
                        : null
                    }

                    {
                      activeTab === 1 ?
                        <div>
                          <textarea className="embed-code" readOnly style={styles.embedCode} value={this.createEmbed('script-tag')}/>
                          <CopyToClipboard
                            text={this.createEmbed('script-tag')}
                            onCopy={() => {
                              this.setState({embedCopied: true});
                              setTimeout(() => this.setState({embedCopied: false}), 5000);
                            }}>
                            <Button raised>Copy</Button>
                          </CopyToClipboard>
                          {
                            this.state.embedCopied
                            ? <span style={ styles.copied }>Copied!</span>
                            : null
                          }
                        </div>
                      : null
                    }
                  </section>
                </div>

                <div>
                  <h4 style={ styles.dialogSubTitle }>Standalone Form URL</h4>
                  <textarea className="standalone-form-url" readOnly style={styles.embedCode} value={this.createEmbed('standalone')}/>
                    <CopyToClipboard
                      text={this.createEmbed('standalone')}
                      onCopy={() => {
                        this.setState({standaloneCopied: true});
                        setTimeout(() => this.setState({standaloneCopied: false}), 5000);
                      }}>
                      <Button raised>Copy</Button>
                    </CopyToClipboard>
                    {
                      this.state.standaloneCopied
                      ? <span style={ styles.copied }>Copied!</span>
                      : null
                    }
                </div>
              </div>
            </Modal>
          ): null }
        </div>
      </div>
    );
  }

}

const styles = {
  leftPan: {
    width: 400
  },
  leftContainer: {
    flex: 1,
    marginRight: 20,
    padding: 20,
    paddingTop: 10,
    paddingLeft: 0,
    color: '#5D5D5D',
    borderRadius: 4,
    marginBottom: 20
  },
  typeList: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '10px',
    marginBottom: '20px'
  },
  leftContainerTitle: {
    fontWeight: 'bold',
    marginBottom: '5px',
    fontSize: '.9em'
  },
  leftContainerSubTitle: {
    margin: '20px 0',
    fontSize: '14pt'
  },
  typesSubTitle: {
    fontSize: 16,
    marginBottom: 10
  },
  embedCode: {
    width: '100%',
    padding: '15px',
    color: '#5d5d5d',
    marginBottom: 10,
    marginTop: 10,
    resize: 'none'
  },
  dialogSubTitle: {
    margin: '15px 0',
    fontWeight: 'bold'
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 30
  },
  copied: {
    paddingLeft: '15px',
    color: '#0a0'
  },
  dialogContent: {
    padding: 15
  }
};
