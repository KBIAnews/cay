import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { DragSource } from 'react-dnd';
import FaTrash from 'react-icons/lib/fa/trash';
import FaClose from 'react-icons/lib/fa/close';
import FaArrowCircleUp from 'react-icons/lib/fa/arrow-circle-up';
import FaArrowCircleDown from 'react-icons/lib/fa/arrow-circle-down';
import { updateWidget } from 'forms/FormActions';

import TextFieldEditor from 'forms/editors/TextFieldEditor';
import MultipleChoiceEditor from 'forms/editors/MultipleChoiceEditor';

const renderSettings = {
  TextField(field, props) {
    return (
      <TextFieldEditor field={ field } { ...props } />
    );
  },

  MultipleChoice(field, props) {
    return (
      <MultipleChoiceEditor field={ field } { ...props } />
    )
  }
};

const askSource = {
  beginDrag(props) {
    return {
      field: props.field,
      id: props.id,
      onList: props.onList,
      position: props.position
    };
  },
  endDrag(props, monitor, component) {
    // console.log("enddrag");
  }
};

@DragSource('form_component', askSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
@connect(({ forms }) => ({
  widgets: forms.widgets
}))
export default class FormComponent extends Component {
  static propTypes = {
    field: PropTypes.object.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.number
  };

  constructor(props, context) {
    super(props, context);
    this.state = { 'expanded': false };
  }

  render() {
    const { connectDragSource, onList } = this.props;
    return onList ?
      this.renderEdit()
      : this.renderType();
  }

  toggleExpanded() {
    if (this.props.onList) {
      this.setState({ expanded: !this.state.expanded })
    }
  }

  renderType() {
    const { isDragging, field } = this.props;
    return (
      this.props.connectDragSource(
        <div onClick={this.onClick.bind(this)} style={styles.askComponent(isDragging)}>
          {field.title}
        </div>
      )
    );
  }

  onIdentityClick(e) {
    this.props.dispatch(updateWidget(this.props.id, { identity: e.target.checked }));
  }

  onDescriptionChange(e) {
    this.props.dispatch(updateWidget(this.props.id, { description: e.target.value }));
  }

  onTitleChange(e) {
    this.props.dispatch(updateWidget(this.props.id, { title: e.target.value }));
  }

  renderEdit() {
    const { id, onMove, isLast, field, position, onDelete } = this.props;
    return (
      <div>
        { this.props.connectDragSource(
            <div style={styles.editContainer}>
              <div>{ position + 1 }.</div>
              <div style={styles.editBody} onClick={ this.toggleExpanded.bind(this) }>
                <h4>
                  { field.title }
                  {
                    field.wrapper && field.wrapper.required ?
                      <span style={ styles.requiredAsterisk }>*</span>
                    :
                      null
                  }
                  {
                    field.identity ?
                      <span style={ styles.identityLabel }>PII</span>
                    :
                      null
                  }
                </h4>
              </div>
              <div style={styles.arrowContainer}>
                <button style={styles.delete} onClick={ () => onDelete(position) }><FaTrash /></button>
                { position !== 0 ? <button onClick={() => onMove('up', position)} style={styles.arrow}><FaArrowCircleUp /></button> : null  }
                { !isLast ? <button onClick={() => onMove('down', position)} style={styles.arrow}><FaArrowCircleDown /></button> : null  }
              </div>
            </div>
          )
        }
        {
          this.state.expanded ?
            <div style={ styles.editSettingsPanel }>
              <label style={ styles.label }>
                <strong>Question</strong> (or field label):
                <input
                  onChange={ this.onTitleChange.bind(this) }
                  style={ styles.bigInput }
                  defaultValue={ this.props.field.title }
                  type="text"
                  placeholder="Ex: What is art?" />
              </label>
              <label style={ styles.label }>
                <strong>Description</strong>/helper text:
                <input
                  onChange={ this.onDescriptionChange.bind(this) }
                  defaultValue={ field.description }
                  style={ styles.bigInput }
                  type="text"
                  placeholder="Ex: Explain ART in a short sentence." />
              </label>
              <div style={ styles.identity }>
                <label>
                  <input
                    onClick={ this.onIdentityClick.bind(this) }
                    checked={ field.identity }
                    type="checkbox"
                     />
                   Has identity data
                </label>
                <p>Check if this field contains <a href="#" style={ { color: '#999' } }>Personally Identifiable Information</a> (e-mails, last names, etc)</p>
              </div>

              {this.editSettings()}

              <button style={ styles.editSettingsPanelSave } onClick={ this.toggleExpanded.bind(this) }>Save</button>
              <button style={ styles.editSettingsPanelClose } onClick={ this.toggleExpanded.bind(this) }><FaClose /></button>
            </div>
          :
            null
        }
      </div>
    );
  }

  onEditorChange(field) {
    this.props.dispatch(updateWidget(field.id, field));
  }

  editSettings() {
    const { field } = this.props;
    // Passing listeners down from this class to the editors
    var localProps = { onEditorChange: this.onEditorChange.bind(this) };
    return renderSettings[field.component] ? renderSettings[field.component](field, localProps) : renderSettings['TextField'](field, localProps);
  }

  onClick() {
    const {onList, field, onClick } = this.props;
    if (!onList) {
      onClick(field);
    }
  }

}

export const styles = {
  askComponent: function(isDragging) {
    return {
      opacity: isDragging ? 0.75 : 1,
      marginBottom: 10,
      shadowOffset: { height: 1, width: 0},
      boxShadow: '0 1px 3px #9B9B9B',
      lineHeight: '40px',
      cursor: 'pointer',
      padding: '0 10px',
      height: 40,
      backgroundColor: '#fff',
      borderRadius: 3,
      fontSize: 14,
      fontWeight: 'bold',
      width: '48%',
      textAlign: 'left',
      margin: '1%'
    };
  },
  editContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    padding: '10px 10px 10px 20px',
    boxShadow: '0 1px 3px #9B9B9B',
    borderRadius: 4,
    height: 60,
    lineHeight: '40px'
  },
  editBody: {
    flex: 1,
    marginLeft: 10
  },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  arrow: {
    width: '40px',
    height: '40px',
    padding: '0',
    lineHeight: '20px',
    marginLeft: '5px',
    border: '1px solid #CCC',
    background: 'none',
    borderRadius: '4px',
    fontSize: '14pt',
    display: 'inline-block',
    cursor: 'pointer'
  },
  delete: {
    width: '40px',
    height: '40px',
    padding: '0',
    lineHeight: '20px',
    marginLeft: '5px',
    border: '1px solid #CCC',
    background: '#DDD',
    borderRadius: '4px',
    fontSize: '14pt',
    display: 'inline-block',
    cursor: 'pointer'
  },
  editSettingsPanel: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: 'auto',
    padding: '40px',
    backgroundColor: '#fafafa',
    boxShadow: '0px 2px 15px #444'
  },
  editSettingsPanelSave: {
    fontSize: '11pt',
    height: '40px',
    background: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginTop: '10px',
    lineHeight: '40px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  editSettingsPanelClose: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '16pt',
    border: 'none',
    background: '#ddd',
    borderRadius: '40px',
    height: '40px',
    width: '40px',
    lineHeight: '20px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  label: {
    display: 'block',
    width: '100%',
    marginBottom: '10px'
  },
  bigInput: {
    fontSize: '12pt',
    padding: '10px',
    width: '50%',
    border: '1px solid #ccc',
    display: 'block'
  },
  requiredAsterisk: {
    color: '#B22'
  },
  identity: {
    padding: '20px 0'
  },
  identityLabel: {
    fontSize: '10pt',
    color: 'white',
    padding: '0 5px',
    borderRadius: '3px',
    marginLeft: '15px',
    display: 'inline-block',
    background: '#999',
    height: '30px',
    lineHeight: '30px'
  }
};