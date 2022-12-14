const PDFParser  = require("pdf2json/pdfparser");
const R = require("ramda");
const { camelCase } = require("lodash");

let FILTERED_VALUES = [];
const TEXT_SEPARATOR = ":";
const DISTANCE_DELTA = 0.1;

const getHLines = R.compose(R.map(R.prop("y")), R.flatten, R.prop("HLines"));

const getTexts = R.compose(R.slice(1, Infinity), R.prop("Texts"));

const areAdjacentBlocks = (t1, t2) => {
  if (t1.y < t2.y - DISTANCE_DELTA) {
    if (Math.abs(t1.x - t2.x) <= DISTANCE_DELTA) {
      return false;
    }
  }
  return true;
};

const isDistanceBetweenEmptyBlock = (t1, t2) => {
  return t2.x - t1.x > 7.75;
};

const getHLinesY = (items) => {
  let arr = [];
  items.forEach((element) => {
    const text = decodeURIComponent(R.trim(R.path(["R", 0], element).T)).split(
      TEXT_SEPARATOR
    )[0];
    if (FILTERED_VALUES.includes(text)) {
      arr.push(element.y);
    }
  });
  return arr;
};

const getHLinesByTexts = R.compose(getHLinesY, R.flatten, R.prop("Texts"));

const getRawTexts = R.compose(
  R.map(
    R.evolve({
      T: R.compose(R.trim, decodeURIComponent),
    })
  ),
  R.flatten,
  R.map(R.prop("R"))
);

const isBold = (text) => text.TS[2] === 1;

const parsePages = (pages, options = {}) => {
  const hasName = R.has(R.__, options);
  if (hasName("partition")) {
    FILTERED_VALUES = R.prop("partition", options);
  }

  /*const hlinesPaged = R.map(
    hasName("partition") ? getHLinesByTexts : getHLines,
    pages
  );*/
  const hlinesPaged = [
    [3.5970000000000004, 13.574, 20.359, 23.981, 30.939, 35.309, 39.621],
    [5.38, 8.888, 10.043, 14.839],
  ];

  const textsPaged = R.map(getTexts, pages);
  let groups = [];

  // Groups texts according to hlines
  for (let i = 0; i < pages.length; i++) {
    const hlines = hlinesPaged[i];
    const texts = textsPaged[i];

    groups.push(
      R.groupBy((text) => R.findIndex((hline) => text.y < hline)(hlines), texts)
    );
  }

  // Combine groups below last hline on a page and above first hline on next page
  for (let i = 1; i < groups.length; i++) {
    if (!groups[i - 1]["-1"] || !(groups[i]["0"] || groups[i]["-1"])) continue;
    if (groups[i]["0"]) {
      groups[i]["0"] = R.concat(groups[i - 1]["-1"], groups[i]["0"]);
    } else {
      groups[i]["-1"] = R.concat(groups[i - 1]["-1"], groups[i]["-1"]);
    }
    delete groups[i - 1]["-1"];
  }

  // Unnest pages and collect groups into a single array of groups,
  // then get the texts within each group
  return groups;
};

const getSections = (groups) => {
  // Get the sections
  const sections = {};
  groups = R.compose(R.unnest, R.map(R.valuesIn))(groups);
  //const [summary, ...profile] = groups;
  sections.summary = getSummary(R.map(getRawTexts)(groups)[0]);
  sections.profile = getSponsorShip(groups.slice(1, Infinity));
  return sections;
};

const getSponsorShip = (rawTexts) => {
  const first = rawTexts.slice(0, 4);
  const last = rawTexts.slice(4);
  let sponsorship = [];

  first.forEach((element) => {
    let fields = [];
    let data = {};
    const [head, ...texts] = getRawTexts(element);
    data.label = R.map(R.trim, head.T.split(TEXT_SEPARATOR));
    if (data.label[0] == "Flags") {
      let flags = [];
      let iter = 0;
      texts.forEach((el) => {
        if (camelCase(el.T) !== "flagNote") {
          flags.push({ name: el.T, note: "" });
        } else {
          if (iter < texts.length - 1 && !isBold(texts[iter + 1]))
            flags[iter - 1].note = texts[iter + 1].T;
        }
        iter++;
      });
      fields = flags;
    } else {
      for (let i = 1; i < texts.length; i++) {
        const currText = texts[i];
        const lastText = texts[i - 1];
        if (isBold(lastText) && isBold(currText)) {
          fields.push({ name: lastText.T, value: "" });
        } else {
          fields.push({ name: lastText.T, value: currText.T });
          i += 1;
        }

        if (texts.length % 2 !== 0 && texts.length === i + 1) {
          if (isBold(texts[texts.length - 1])) {
            fields.push({ name: texts[texts.length - 1].T, value: "" });
          } else {
            fields[fields.length - 1].value = `${
              fields[fields.length - 1].value
            } ${texts[texts.length - 1].T}`;
          }
        }
      }
    }

    data.fields = fields;
    sponsorship.push(data);
  });

  last.forEach((el) => {
    let data = {};
    if (
      camelCase(decodeURIComponent(el[0].R[0].T)) === "additionalInformation"
    ) {
      el = getRawTexts(el);
      const [head, ...texts] = el;
      data.label = head.T;
      data.fields = [
        {
          name: texts[0].T + " " + texts[1].T,
          value: texts[2].T + " " + texts[3].T,
        },
        {
          name: texts[4].T + " " + texts[5].T,
          value: texts[6].T + " " + texts[7].T,
        },
        {
          name: texts[8].T,
          value: R.map(R.prop("T"), texts.slice(9, texts.length)).join(" "),
        },
      ];
    } else {
      let [head, ...texts] = el;
      data.label = decodeURIComponent(head.R[0].T);
      const rePSponsor = RegExp(".Counter");
      const reValueRadio = RegExp("No|Partial");
      let isAllSponsorGroup = Boolean(false);
      if (camelCase(data.label) === "allSponsorships") {
        data = Object.assign(data, {
          ACounter: {
            label: decodeURIComponent(texts[4].R[0].T),
            counter: {
              name: decodeURIComponent(texts[0].R[0].T),
              value: texts[1].R[0].T,
            },
            heads: [],
            rows: {},
          },
          PCounter: {
            label: "",
            counter: {
              name: decodeURIComponent(texts[2].R[0].T).trim(),
              value: texts[3].R[0].T,
            },
            heads: [],
            rows: {},
          },
        });
        texts = texts.slice(5, texts.length);
        isAllSponsorGroup = true;
      } else {
        data = Object.assign(data, { heads: [], rows: {} });
        isAllSponsorGroup = false;
      }

      let countCol = -1;
      let isPSponsor = Boolean(false);
      let prevText = null;
      let titles = [];
      for (let i = 0; i < texts.length; i++) {
        const element = texts[i];
        const title = decodeURIComponent(element.R[0].T).trim();
        if (isBold(element.R[0])) {
          if (isAllSponsorGroup) {
            if (rePSponsor.test(title)) {
              data.PCounter.label = title;
              isPSponsor = true;
            }
            if (!isPSponsor) {
              data.ACounter.heads.push(title);
              data.ACounter.rows[camelCase(title)] = [];
            } else {
              data.PCounter.heads.push(title);
              data.PCounter.rows[camelCase(title)] = [];
            }
          } else {
            data.heads.push(title);
            data.rows[camelCase(title)] = [];
          }
        } else {
          if (prevText) {
            if (
              !areAdjacentBlocks(prevText, element) ||
              reValueRadio.test(title)
            ) {
              titles[countCol].push(title);
            } else {
              if (isDistanceBetweenEmptyBlock(prevText, element)) {
                titles.push(["N/A"]);
                countCol += 1;
              }
              titles.push([title]);
              prevText = element;
              countCol += 1;
            }
          } else {
            prevText = element;
            titles.push([title]);
            countCol += 1;
          }
        }
      }

      if (isAllSponsorGroup) {
        const posHead = data.ACounter.heads.length - 2;
        data.ACounter.heads[posHead] = `${
          data.ACounter.heads[posHead]
        } ${"ID"}`;
        data.PCounter.heads[posHead] = `${
          data.PCounter.heads[posHead]
        } ${"ID"}`;
        data.ACounter.heads = data.PCounter.heads = R.dropLast(
          1,
          data.ACounter.heads
        ); // equal heads for one call function in this case, separate function ...

        data.PCounter.rows = data.ACounter.rows;
      }

      let iter = 0;
      let firstRow = Boolean(true);
      let textOver = false;
      for (const iterator of titles) {
        if (isAllSponsorGroup) {
          if (data.ACounter.heads.length - 1 == iter) {
            iter = 0;
            firstRow = false;
          }
          if (firstRow && data.ACounter.heads.length - 1 > iter) {
            data.ACounter.rows[camelCase(data.ACounter.heads[iter])].push(
              iterator.length < 1 ? iterator[0] : iterator.join(" ")
            );
          } else {
            data.PCounter.rows[camelCase(data.ACounter.heads[iter])].push(
              iterator.length < 1 ? iterator[0] : iterator.join(" ")
            );
          }
        } else {
          if (data.heads.length == iter) {
            iter = 0;
            firstRow = false;
          }
          if (firstRow && data.heads.length > iter) {
            data.rows[camelCase(data.heads[iter])].push([
              iterator.length < 1 ? iterator[0] : iterator.join(" "),
            ]);
          } else {
            if (data.heads.length - 1 == iter) {
              textOver = true;
            }
            data.rows[camelCase(data.heads[iter])][0].push(
              iterator.length < 1 ? iterator[0] : iterator.join(" ")
            );
          }
        }
        if (!textOver) iter++;
      }
    }
    sponsorship.push(data);
  });
  return sponsorship;
};

const getSummary = (rawTexts) => {
  const [head, ...texts] = rawTexts;
  let summary = {};
  let fields = [];
  summary.label = head.T;
  for (let i = 1; i < texts.length - 1; i += 2) {
    const currText = texts[i];
    const lastText = texts[i - 1];
    fields.push({ name: lastText.T, value: currText.T });
  }
  summary.fields = fields;
  return summary;
};

exports.parse = (pdfBuffer) =>
  new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      try {
        var data = getSections(
          parsePages(pdfData.Pages, {
            partition: [
              "UAC??Basic??Information",
              "Demographic??Information",
              "Relationship??to??UC",
              "Contact??Information",
              "Flags",
              "Additional??Information",
              "All??Sponsorships",
              "Addresses",
              "Other??Sponsors??Using??Address",
              "Household??Information",
              "Affidavits??of??Support:",
            ],
          })
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
    pdfParser.on("pdfParser_dataError", (errData) => {
      return reject(errData);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
