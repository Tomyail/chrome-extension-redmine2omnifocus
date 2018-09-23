import '../css/popup.css';
import Greeting from './popup/greeting_component.jsx';
import React from 'react';
import { render } from 'react-dom';
import * as _ from 'lodash';

render(<Greeting />, window.document.getElementById('app-container'));

chrome.storage.sync.get(['config'], items => {
  if (_.isEmpty(items)) {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  } else {
    const bg = chrome.extension.getBackgroundPage();
    bg.main(items['config']);
  }
});
