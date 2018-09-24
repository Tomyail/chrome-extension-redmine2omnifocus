import '../css/options.css';

import * as _ from 'lodash';
import * as R from 'ramda';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { defaultConfig } from './config';

const Input = ({ type, id, onChange, placeholder, example }) => {
  return (
    <div>
      <input
        style={{ width: '80%' }}
        type={type}
        defaultValue={example}
        onChange={event => onChange(id, event.target.value)}
      />
      {placeholder}
    </div>
  );
};

const OmnifocusCheckbox = ({
  id,
  name,
  schema,
  onChange,
  onCheck,
  isChecked
}) => {
  return (
    <div style={{ display: 'flex' }}>
      <input
        style={{ width: '80%' }}
        type="text"
        placeholder={schema}
        defaultValue={schema}
        onChange={event => onChange(id, event.target.value)}
      />
      {name}
      <input
        type="checkbox"
        defaultChecked={isChecked}
        onChange={event => onCheck(id, event.target.checked)}
      />
    </div>
  );
};

const config = {};
const onChange = (id, e) => {
  config[id] = e;
};

const onCheck = (id, e) => {
  config[`${id}_checked`] = e;
};

const onSave = () => {
  R.forEach(item => {
    const itemId = config[item.id]
    const itemIsChecked = `${itemId}_checked`
    if (itemId) {
      item.value = itemId;
    }
    if (config.hasOwnProperty(itemIsChecked)) {
      item.isChecked = config[itemIsChecked];
    }
  })(globalConfig);
  const result = R.filter(
    R.and(R.propEq('group', 'omnifocus'), R.propEq('isChecked', true))
  )(globalConfig);
  if (result.length > 0) {
    chrome.storage.sync.set({ config: globalConfig }, err => {
      console.log('ok', err);
    });
  } else {
    console.error('omnifocus need at lease one tag');
  }
};
class Options extends Component {
  render() {
    const [ redmine, omnifocus ] = ['redmine', 'omnifocus'].map(i => R.filter(R.propEq('group', i))(this.props.config))
    return (
      <div>
        {redmine.map((item, key) => (
          <Input
            key={key}
            type="text"
            id={item.id}
            placeholder={item.placeholder}
            example={item.value}
            onChange={onChange}
          />
        ))}
        {omnifocus.map((item, key) => (
          <OmnifocusCheckbox
            key={key}
            id={item.id}
            name={item.id}
            schema={item.value}
            onChange={onChange}
            onCheck={onCheck}
            isChecked={item.isChecked}
          />
        ))}
        <div>
          available meta
          <div>"name":redmine issue assigned name</div>
          <div>"description": redmine issue description</div>
          <div>"id": redmine issue id</div>
          <div>"status": redmine issue status</div>
          <div>"subject": redmine issue subject</div>
          <div>"url": redmine issue url</div>
        </div>

        <button onClick={onSave}>save</button>
      </div>
    );
  }
}

let globalConfig;
chrome.storage.sync.get(['config'], items => {
  globalConfig = !_.isEmpty(items) ? items['config'] : defaultConfig;
  render(
    <Options config={globalConfig} />,
    window.document.getElementById('app-container')
  );
});
