import DataLoader from 'dataloader';

export default class KnexDataLoader extends DataLoader {
  constructor(query, keyField) {
    async function modifiedFn(ids) {
      const data = await query.whereIn(keyField, ids);

      const map = new Map();
      ids.forEach((item) => map.set(item, []));
      data.forEach((item) => map.get(item[keyField]).push(item));
      return ids.map((id) => map.get(id));
    }

    super(modifiedFn);
  }
}
