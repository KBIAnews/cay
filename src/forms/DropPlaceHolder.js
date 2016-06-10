import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import { DropTarget } from 'react-dnd';

import { appendWidget, moveWidget } from 'forms/FormActions';

const askTarget = {

  // Hover changes the component's internal state
  hover(props, monitor, component) {

    let formDiagram = component.props.formDiagram;
    let targetPosition = component.props.position;

    if (targetPosition != formDiagram.previousHover) {
      formDiagram.previousHover = targetPosition;
    } else {
      return; // hovering the same as before? early return, do nothing.
    }

    let tempWidgets = formDiagram.previousState.slice();
    var draggedItem = monitor.getItem();

    draggedItem.field.dropped = false;

    if (draggedItem.onList) {
      // First we make a copy removing the dragged element
      let fieldsCopy = tempWidgets.slice();
      fieldsCopy.splice(draggedItem.position, 1);

      let fieldsBefore = fieldsCopy.slice(0, targetPosition);
      let fieldsAfter = fieldsCopy.slice(targetPosition);
      tempWidgets = fieldsBefore.concat(draggedItem.field).concat(fieldsAfter);

    } else {
      // If hovering over the default empty placeholder (the bottom one)
      if (component.props.empty) {
        tempWidgets[targetPosition] = draggedItem.field;
      } else {
        // if hovering over an existing field
        let fieldsBefore = tempWidgets.slice(0, targetPosition);
        let fieldsAfter = tempWidgets.slice(targetPosition);
        tempWidgets = fieldsBefore.concat(draggedItem.field).concat(fieldsAfter);
      }
    }

    formDiagram.setState({ tempWidgets: tempWidgets, isHovering: true });

  },

  // persist state only on drop
  drop(props, monitor, component) {

    let formDiagram = component.props.formDiagram;
    let fields = formDiagram.previousState.slice();
    let targetPosition = component.props.position;

    var draggedItem = monitor.getItem();

    draggedItem.field.dropped = true;

    // If we are dragging an item already on the form
    if (draggedItem.onList) {
      formDiagram.moveWidget(draggedItem.position, targetPosition);
    } else {
      formDiagram.appendWidget(draggedItem.field, targetPosition);
      formDiagram.setState({ isHovering: false });
    }

  }
};


@DropTarget('form_component', askTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
}))
@connect(({ app, forms }) => ({ app, forms }))
export default class DropPlaceHolder extends Component {

  render() {
    return (
      this.props.connectDropTarget(
        this.props.isOver ?
          <div style={ styles.dropPlaceHolderActive }>
          </div>
        :
          <div style={ styles.dropPlaceHolder }>
            {
              this.props.children ?
                this.props.children
              :
                <p style={ styles.emptyPlaceholderText }>Drag and drop fields here to add a question</p>
            }
          </div>
      )
    );
  }
}

const styles = {
  dropPlaceHolder: {
    height: '60px',
    background: 'rgba(128,128,128,.1)',
    marginBottom: '10px',
    borderRadius: '4px'
  },
  dropPlaceHolderActive: {
    border: '1px dashed #111',
    height: '60px',
    background: 'rgba(0,0,0,.1)',
    padding: '30px',
    borderRadius: '4px',
    marginBottom: '10px'
  },
  emptyPlaceholderText: {
    textAlign: 'center',
    fontSize: '15pt',
    lineHeight: '60px',
    border: '1px dashed #111'
  }
};