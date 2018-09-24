import '../img/icon-128.png';
import '../img/icon-34.png';
import * as R from 'ramda';
import * as _ from 'lodash';
import { stringify } from 'qs';

const fname = { name: 'name', fn: item => _.get(item, 'assigned_to.name') };
const fdesc = { name: 'description', fn: item => _.get(item, 'description') };
const fid = { name: 'id', fn: item => item.id };
const fstatus = { name: 'status', fn: item => _.get(item, 'status.name') };
const fsubject = { name: 'subject', fn: item => item.subject };
// https://redmine.saybot.net/issues/69807
const furl = { name: 'url', fn: item => `${item.url}/issues/${item.id}` };

const rules = [fname, fdesc, fid, fstatus, fsubject, furl];
const fissue = item => _.get(item, 'issue');
const fissues = item => _.get(item, 'issues');

function main(config) {
  const REDMINE_URL = R.find(R.propEq('id', 'redmineUrl'))(config).value;
  const REDMINE_API_KEY = R.find(R.propEq('id', 'redmineApiKey'))(config).value;
  const omnifocusContext = R.filter(R.propEq('group', 'omnifocus'))(config);
  run();
  async function run() {
    const { tab, issueUrl } = await getRedmineIssueUrl();
    const data = await fetchRedmine(`${issueUrl}`);

    const validData = fissues(data) || [fissue(data)];
    // const validName = R.filter(item => fname.fn(item) === name)(validData);
    // const validStatus = R.filter(
    //   item => statusList.indexOf(fstatus.fn(item)) >= -1
    // )(validName);

    const addMeta = R.map(item => Object.assign(item, { url: REDMINE_URL }))(
      validData
    );

    const generateOfUrlSchema = item => {
      // https://inside.omnifocus.com/url-schemes
      const results = R.map(context =>
        Object.assign(context, { parsed: parse(context.value, rules, item) })
      )(omnifocusContext);
      const omnifocusTarget = {};
      R.forEach(result => {
        omnifocusTarget[result.id] = result.parsed;
      })(results);
      return omnifocusTarget;
    };

    const mapToOmniFocus = R.map(generateOfUrlSchema)(addMeta);

    setInterval(() => {
      if (mapToOmniFocus.length) {
        const om = mapToOmniFocus.pop();
        console.log(`omnifocus:///add?${stringify(om)}`);
        openUrl(tab.id, `omnifocus:///add?${stringify(om)}`);
      }
    }, 500);
  }

  function openUrl(tabId, url) {
    chrome.tabs.executeScript(tabId, {
      code: `
        document.body.insertAdjacentHTML(
          "afterend",
          '<iframe src="${url}" style="display:none" />'
        );`
    });
  }
  function parse(input, rules, item) {
    const reg = new RegExp('{*}', 'g');
    let result;
    while ((result = reg.exec(input)) !== null) {
      const head = input.substr(0, reg.lastIndex).lastIndexOf('{') + 1;
      const tail = result.index;
      const target = input.slice(head, tail);
      const targtRule = R.find(R.propEq('name', target))(rules);
      if (targtRule) {
        input = input.replace(`{${target}}`, `${targtRule.fn(item)}`);
      } else {
        input = input.replace(`{${target}}`, `{${target}}`);
        console.warn(`invalid target: ${target}`);
      }
    }
    return input;
  }

  function getRedmineIssueUrl() {
    return new Promise(resolve => {
      chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
        const url = new URL(tabs[0].url);
        resolve({
          tab: tabs[0],
          issueUrl: `${url.origin}${url.pathname}.json${url.search}`
        });
      });
    });
  }

  function fetchRedmine(url) {
    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Redmine-API-Key': REDMINE_API_KEY
      }
    })
      .then(response => response.json())
      .catch(error => console.error(error));
  }
}

window.main = main;
