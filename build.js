'use strict';
const mkdirp = require('mkdirp');
const episodes = require('./content/episodes.json');
const panelists = require('./content/panelists.json');
const write = require('./lib/write');
const createUrl = require('./lib/create-url');
const ellipsize = require('ellipsize');
const mailing = require('./lib/mailing');
const panelistPage = require('./lib/panelists');
const epList = require('./lib/episode-json');

// Templates
const main = require('./templates/main');
const episodeList = require('./templates/episode-list');
const episodePage = require('./templates/episode-page');
const episodeGuests = require('./templates/episode-guests');
const episodeLinks = require('./templates/episode-links');
const episodePicks = require('./templates/episode-picks');
const episodePanel = require('./templates/episode-panel');
const shirtPage = require('./templates/shirts-page');
const contentPage = require('./templates/content-page');

// content
const privacyContent = require('./content/privacy');
const termsContent = require('./content/terms');
const amaContent = require('./content/ama');

// store the output of HTML markup
let mainOutput = '';

let panel;
episodes.reverse();
for(let i = episodes.length - 1; i >= 0; i--) {
  const epTitle = episodes[i].title;
  panel = episodes[i].panel;
  const epDate = episodes[i].published;
  const epDesc = episodes[i].description;
  const link = createUrl(epTitle);
  const id = episodes[i].id;
  const picks = episodes[i].picks;
  const links = episodes[i].links;
  const guests = episodes[i].guests;
  const shortDesc = ellipsize(epDesc, 240);
  const transcript = episodes[i].transcribed;
  const episodeNum = episodes[i].episode;

  // create episode list for homepage
  mainOutput += episodeList(link, epTitle, epDate, shortDesc);

  // build episode output
  let episodeOutput = '';

  // add episode content info
  episodeOutput += episodePage(epDate, id, epDesc);

  // if a guest exists add heading and guest info
  if(guests.length !== 0) {
    // add episode guests
    episodeOutput += episodeGuests(guests);
  }

  // if there are episode links available add them to the page with a links heading
  if(links.length !== 0) {
    // add episode links
    episodeOutput += episodeLinks(links);
  }

  // if there are picks for the episode add picks section
  if(picks.length !== 0) {
    // add pick links
    episodeOutput += episodePicks(picks);
  }

  // create panel list
  episodeOutput += episodePanel(panelists, panel);

  // transcript
  if(transcript === true) {
    const transcriptContent = require('./transcripts/' + episodeNum)();
    episodeOutput += '<div class="transcript"><h3>Episode transcript</h3>';
    episodeOutput += transcriptContent;
    episodeOutput += '</div>';
  }

  // create a directory for each episode
  mkdirp.sync(`./episodes/${link}`);

  // create index.html for each episode
  write(`./episodes/${link}/index.html`, main('episode', episodeOutput, epTitle, epDesc));
}

// output slimmed down version of main episode JSON
epList();

// update index.html
write('index.html', main('home', mainOutput));

// create mailing list page
mailing();

// create paenlist pages
panelistPage();

// create ama page
const AmaTitle = 'AMA';
const AmaDesc = `We'd love to answer questions from our listeners. Leave us a message with your questions and we'll answer them in a future episode.`;
contentPage('ama', amaContent, AmaTitle, AmaDesc);

//create privacy page
contentPage('privacy', privacyContent, 'Privacy Policy');

//create terms page
contentPage('terms', termsContent, 'Terms of Use');

//create shirt page
shirtPage('shirts', 'T-Shirts', 'Purchase Front End Happy Hour t-shirts and clothing.');
