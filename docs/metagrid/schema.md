# MetaGrid データモデル

## エンティティ（Entity）

エンティティとは、組織が把握し、判断の対象にしたいものです。システム、データセット、テーブル、カラム、レポート、ビジネス用語、業務プロセス、組織、ロールなどが該当します。

各エンティティのディレクトリには `entity.json` を置きます。

例:

```json
{
  "id": "bigquery:project-a.dataset-a.customer.email",
  "type": "column",
  "name": "email",
  "parent": "bigquery:project-a.dataset-a.customer",
  "aliases": ["customer email", "顧客メール"]
}
```

エンティティ ID は安定しており、MetaGrid 内で一意でなければなりません。

## ファクト（Fact）

ファクトとは、1 つのエンティティに関する、1 つの独立した主張です。

例:

```json
{
  "id": "fact-000001",
  "property": "personal_data",
  "value": true,
  "status": "verified",
  "valid_from": "2024-10-01",
  "valid_to": null,
  "sources": ["confluence:123456"]
}
```

`facts.json` ファイルには、エンティティ ID とファクトの配列を記述します。

例:

```json
{
  "entity": "bigquery:project-a.dataset-a.customer.email",
  "facts": []
}
```

複数の独立した主張を 1 つのファクトに入れてはいけません。

## ファクトのステータス

使用できるステータスは次のとおりです。

- `verified`
- `candidate`
- `conflicting`
- `deprecated`

`verified` には十分な証拠が必要です。

`candidate` は、もっともらしいが未確認の情報に使います。

`conflicting` は、矛盾する証拠が存在する場合に使います。

`deprecated` は、以前は有効だったが現在は有効ではないファクトに使います。

## 有効期間

`valid_from` と `valid_to` は、そのファクトがいつ真であるかを表します。ソースページの作成日や編集日を表すものではありません。

日付が分かっている場合は `YYYY-MM-DD` 形式で記述します。

終了日が不明で、ファクトが現在も有効な場合は `null` を使います。日付を省略するのは、どうしても特定できない場合だけにしてください。

## プロパティ（Property）

プロパティは次のファイルで定義します。

```text
metagrid/config/properties.json
```

可能な限り既存のプロパティを再利用してください。同じ概念に対して `pii`、`personal_info`、`personal_data` のような同義語を導入してはいけません。

プロパティには、期待する値の型を任意で指定できます。

## ソース（Source）

ソースは、証拠の出どころを記録します。

例:

```json
{
  "id": "confluence:123456",
  "type": "confluence",
  "title": "顧客データ連携仕様",
  "url": "https://example.atlassian.net/wiki/...",
  "section": "3.2 顧客メールアドレス",
  "created_at": "2024-02-10",
  "updated_at": "2025-04-10"
}
```

ソースがあるというだけで、ファクトが `verified` になるわけではありません。証拠の内容、権威性、日付、整合性は別途評価する必要があります。

## README.md

`README.md` は、次のような物語的な情報に使います。

- 業務上の背景
- 設計上の根拠
- 変更履歴
- 重要な注意点
- 1 つのプロパティと値の組では表現できない説明

絞り込みや厳密な検索には、引き続き構造化されたファクトを優先して使います。
