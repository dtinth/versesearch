import { fromXml } from 'xast-util-from-xml'
import { toString } from 'xast-util-to-string'
import { selectAll } from 'xast-util-select'
import MiniSearch from 'minisearch'
import fs from 'node:fs'

interface Verse {
  id: string
  text: string
}
const data: Verse[] = []
const tree = fromXml(await Bun.file(Bun.argv[2]).text())

for (const book of selectAll('BIBLEBOOK', tree)) {
  const bookName = book.attributes.bname
  console.log(bookName)
  for (const chapter of book.children) {
    if (chapter.type !== 'element' || chapter.name !== 'CHAPTER') continue
    const chapterNum = chapter.attributes.cnumber
    for (const verse of chapter.children) {
      if (verse.type !== 'element' || verse.name !== 'VERS') continue
      const verseNum = verse.attributes.vnumber
      data.push({
        id: `${bookName} ${chapterNum}:${verseNum}`,
        text: toString(verse).trim(),
      })
    }
  }
}

const miniSearch = new MiniSearch({
  fields: ['id', 'text'],
  storeFields: ['id', 'text'],
})
miniSearch.addAll(data)

const result = Buffer.from(JSON.stringify(miniSearch))
await Bun.write('data.local/index.json', result)
console.log('Written bytes:', result.length)


