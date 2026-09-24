# MetaGrid Agent Starter

AI エージェント向けに設計された、ファイルベースの MetaGrid です。

正（canonical）となる知識は Markdown と JSON として保存します。検索インデックスは正規ファイルから生成されるものであり、手で編集してはいけません。

## セットアップ

Node.js 18 以降があれば十分です。npm の依存パッケージは不要です。

```text
npm run metagrid:check
```

## 主なコマンド

```text
npm run metagrid:validate
npm run metagrid:build
npm run metagrid:check
```

`metagrid:validate` は設定、エンティティ、ファクト、ソースを検証します。

`metagrid:build` は `metagrid/indexes/` と `metagrid/catalog.json` を再生成します。

`metagrid:check` は検証を行ったあと、インデックスを再構築します。

## エンティティの追加

対応するエンティティタイプの配下にディレクトリを作成します。

```text
metagrid/entities/columns/customer.email/
  entity.json
  facts.json
  README.md
```

その後、次を実行します。

```text
npm run metagrid:check
```

詳細なルールは `docs/metagrid/` を参照してください。
