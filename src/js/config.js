export const defaultConfig = [
  {
    id: 'redmineUrl',
    placeholder: 'REDMINE_URL',
    value: 'https://yourredmine.url',
    group: 'redmine'
  },
  {
    id: 'redmineApiKey',
    placeholder: 'REDMINE_API_KEY',
    value: 'get_api_key_at_redmine_user_profile',
    group: 'redmine'
  },
  { id: 'name', value: '{subject}', group: 'omnifocus', isChecked: true },
  {
    id: 'note',
    value: '{url}\n{description}',
    group: 'omnifocus',
    isChecked: true
  },
  {
    id: 'tags',
    value: '🌎Redmine,🏢 Office',
    group: 'omnifocus',
    isChecked: true
  },
  { id: 'project', value: '[Redmine]', group: 'omnifocus', isChecked: true }
];
