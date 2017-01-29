const Handlebars = require('handlebars');
const fs = require('fs');

const files = fs.readdirSync('./input')
                .filter(file => /\.srt$/i.test(file))
                .forEach(file => convert(file));

function convert(file) {
  const content = fs.readFileSync(`./input/${file}`, 'utf-8');

  let lines = content.split(/^[0-9]+\r\n/gm).map(line => line.replace(/\r\n/gi, '\n'));
  lines.shift();

  lines = lines.map((line) => {
    const timing = line.split(' --> ');

    function parseTime(time) {
      const countColon = time.match(/:/g).length;

      if (countColon > 2) time = time.replace(/\:(?=[^:]*$)/g, '.');

      return time;
    }

    const begin = parseTime(timing[0].replace(',', '.'));
    const end = parseTime(timing[1].split('\n')[0].replace(',', '.'));

    let content = timing[1].split('\n');

    content.shift();
    content.pop();
    content.pop();

    content = content.join('\n').replace('\n', '<br />').replace(/&/gm, '&amp;');

    return {
      begin,
      end,
      content,
    };
  });

  const rawtemplate = fs.readFileSync('./template.xml', 'utf-8');
  const template = Handlebars.compile(rawtemplate);

  fs.writeFileSync(`./output/${file}.dfxp`, template({ lines }));
}
