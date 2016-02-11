/* this view is used in both data explorer and user manager */

import React from 'react';
import Radium from 'radium';
import {createFormula} from '../actions';
import Flex from "./layout/Flex";
import Select from 'react-select';
import TextField from './forms/TextField';
import Button from './Button';
import Filter from './filter';

@Radium
class PipelineCreator extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedBreakdown: 'total', // asset|author|section|user|total
      resultFields: [], // what fields the user is interested in measuring; replies, replies per comment, etc
      specificBreakdowns: [], // this could be particular author(s), or a specific section
      // hard-code the date range of the NYT dataset.
      // minDate: '2003-05-13',
      // maxDate: '2015-01-01',
      minDate: '2013-01-01',
      maxDate: '2013-01-02',
      computedQuery: null
    };
  }
  static propTypes = {

  }
  static defaultProps = {

  }

  handleCreatePipeline() {
    this.props.dispatch(createFormula('FILTER_FIELD_VALUES_GO_HERE'))
  }

  getTargets(target) {
    var targets = (target === 'author') ? this.props.authors : this.props.sections;

    return targets.map(t => {
      return {value: t, label: t};
    });
  }

  setSpecificBreakdowns(values) {
    this.setState({specificBreakdowns: values.split(',')});
  }

  getSpecific(selectedBreakdown) {
    if (selectedBreakdown === 'asset') {
      // ????
    } else if (selectedBreakdown === 'author') {
      // return a list of authors
      return (
        <div>
          <p style={styles.label}>on assets written by</p>
          <Select
            options={this.getTargets('author')}
            name="selected-targets"
            placeholder="Author"
            value={this.state.specificBreakdowns.join(',')}
            onChange={this.setSpecificBreakdowns.bind(this)}
            multi={true} />
          </div>
        );
    } else if (selectedBreakdown === 'section') {
      return (
        <div>
          <p style={styles.label}>specifically, these sections</p>
          <Select
            options={this.getTargets('section')}
            name="selected-targets"
            placeholder="Section"
            value={this.state.specificBreakdowns.join(',')}
            onChange={this.setSpecificBreakdowns.bind(this)}
            multi={true} />
          </div>
        );
    } else if (selectedBreakdown === 'user') {
      return (<TextField label="auto-complete user search" />);
    } else {
      return '';
    }
  }

  // this toggles the UI to load more specific options
  updateOutput(breakdown) {
    this.setState({selectedBreakdown: breakdown, specificBreakdowns: []});
  }

  updateFields(values) {
    this.setState({resultFields: values.split(',')});
  }

  getBreakdownOptions() {
    // apparently the asset target returns invalid JSON, hide for now
    var possible = ['total', 'user', /*'asset',*/ 'section', 'author'];

    return possible.map(p => {
      return {value: p, label: p};
    });
  }

  getFieldOptions() {

    return [
      {
        value: 'comments',
        label: 'comments (total, accepted, rejected & escalated)'
      },
      {
        value: 'replies',
        label: 'replies (total)'
      },
      {
        value: 'replies_per_comment',
        label: 'replies (per comment)'
      },
      {
        value: 'accept_ratio',
        label: 'accept ratio'
      }
    ];
  }

  updateDateRange(e) {
    if (e.target === this.refs.date_start) {
      this.setState({minDate: e.target.value});
    } else {
      this.setState({maxDate: e.target.value});
    }
  }

  // we don't want to request 10000 hourly intervals,
  // so compute resonable bin size
  getSensibleInterval(start, end) {
    const hour = 1000 * 60 * 60;
    const day = hour * 24;
    const week = day * 7;
    const diff = end - start;

    if (diff / day < 300) {
      return 'day';
    } else if (diff / week < 300) {
      return 'week';
    } else {
      return 'month';
    }
  }

  render() {

    return (
      <div>
        <p style={styles.label}>I want to know about</p>

        {
          this.props.onlyUser ? "" :
            <Select
              options={this.getBreakdownOptions()}
              name="breakdown-type"
              value={this.state.selectedBreakdown}
              onChange={this.updateOutput.bind(this)} />
        }

        <p style={styles.label}>Show me:</p>
        <Select
          style={{width: 100}}
          onChange={this.updateFields.bind(this)}
          name="selected-field"
          value={this.state.resultFields.join()}
          multi={true}
          options={this.getFieldOptions()}
          placeholder="comments / replies / accept ratio"/>

        { this.props.onlyUser ? this.getSpecific('user') : this.getSpecific(this.state.selectedBreakdown) }

        <p style={styles.label}>between</p>
        <input
          onChange={this.updateDateRange.bind(this)}
          type="date"
          ref="date_start"
          value={this.state.minDate} />

        <p style={styles.label}>and</p>
        <input
          onChange={this.updateDateRange.bind(this)}
          type="date"
          ref="date_end"
          value={this.state.maxDate} />

        <p style={styles.label}> + Add another question for comparison </p>
        <Filter/>
        <div style={{marginTop: 20}}>
          <Button
            category="primary"
            onClick={this.handleCreatePipeline.bind(this)}>
              Create
          </Button>
        </div>
      </div>
    );
  }
}

const styles = {
  backgroundColor: 'white',
  padding: '10px',
  label: {
    marginTop: 10
  }
};

export default PipelineCreator;


// <select
//   onChange={this.updateOutput.bind(this)}
//   style={styles.select}
//   ref="pipelines">
//   <option value={"what_is"}> What is the </option>
// </select>
// <select
//   onChange={this.updateOutput.bind(this)}
//   style={styles.select}
//   ref="pipelines">
//   <option value={"number"}> number of </option>
//   <option value={"ratio"}> ratio of </option>
// </select>
// <select
//   onChange={this.updateOutput.bind(this)}
//   style={styles.select}
//   ref="pipelines">
//   <option value={"rejected comments"}> rejected comments </option>
// </select>
