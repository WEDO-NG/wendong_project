module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 0 = off, 1 = warning, 2 = error
    // 允许 subject 使用中文（禁用大小写检查）
    'subject-case': [0],
    // 允许 subject 为空（如果需要纯中文描述有时会有帮助，但通常保留）
    'subject-empty': [2, 'never'],
    // 允许 type 为空（不建议，保持 conventional commit 规范）
    'type-empty': [2, 'never'],
    // 确保 type 在默认列表里 (feat, fix, docs, etc.)
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
};
