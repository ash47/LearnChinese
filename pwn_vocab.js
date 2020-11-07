const axios = require('axios');
const rateLimit = require('axios-rate-limit');

const httpRequest = rateLimit(axios.create(), { maxRequests: 10, perMilliseconds: 1000, maxRPS: 10 });

const fs = require('fs');
const pinyin = require('chinese-to-pinyin');

const fullFocab = [];

async function prePprocessVocab() {
    // const vocabRef = await getContents('https://www.duolingo.com/vocabulary/overview?_=604747014232');
    const vocabRef = require('./vocab_toload.json'); // from https://www.duolingo.com/vocabulary/overview?_=604747014232
    const vocabOverview = vocabRef.vocab_overview;

    const promises = [];

    for(let i=0; i<vocabOverview.length; ++i) {
        console.log((i+1) + '/' + vocabOverview.length);
        promises.push(processItem(vocabOverview[i]));
    }

    // Wait for them all to finish
    await Promise.all(promises);

    // Store it
    fs.writeFileSync('./learnchinese/src/vocab.json', JSON.stringify(fullFocab, null, 4));

    // done
    console.log('All done!');
}

function processItem(thisItem) {
    return new Promise((acceptTop, rejectTop) => {
        // const theData = await getContents('https://www.duolingo.com/dictionary/Chinese/' + encodeURIComponent(thisItem.word_string) + '/' + thisItem.id);
        // const theData = await getContents('https://d2.duolingo.com/api/1/dictionary/hints/zs/en?format=new&sentence=' + encodeURIComponent(thisItem.word_string));
        getContents('https://www.duolingo.com/api/1/dictionary_page?lexeme_id=' + encodeURIComponent(thisItem.lexeme_id)).then((theData) => {
            const ourPromises = [];
        
            // Process each setence
            const alternativeForms = theData.alternative_forms;
            for(let i=0; i<alternativeForms.length; ++i) {
                const thisAltForm = alternativeForms[i];

                ourPromises.push(new Promise((accept, reject) => {
                    getTokens(thisAltForm.text).then((tokens) => {
                        thisAltForm.tokens = tokens;

                        accept();
                    })
                }))
            }

            const word = theData.word;

            theData.pinyinWithTone = pinyin(word);
            theData.pinyinWithoutTone = pinyin(word, {removeTone:true});
            theData.pinyinNumber = pinyin(word, {toneToNumberOnly:true});
            theData.vocab = thisItem;

            ourPromises.push(new Promise((accept, reject) => {
                getTokens(word).then((tokens) => {
                    theData.tokens = tokens;
                    accept();
                })
            }))

            Promise.all(ourPromises).then(() => {
                fullFocab.push(theData);
                console.log('Completed ' + fullFocab.length);
                acceptTop();
            });            

            //fs.writeFileSync('./vocab/' + thisItem.lexeme_id + '.json', JSON.stringify(theData, null, 4));
        }).catch(rejectTop);
    });
}

function getTokens(theString) {
    return new Promise((accept, reject) => {
        getContents('https://d2.duolingo.com/api/1/dictionary/hints/zs/en?format=new&sentence=' + encodeURIComponent(theString)).then((tokenInfo) => {
            accept(tokenInfo.tokens);
        }).catch(reject);
    });
}

function getContents(requestUrl) {
    return new Promise((accept, reject) => {
        httpRequest.get(requestUrl).then((responseInfo) => {
            accept(responseInfo.data);
        }).catch(reject);
    });
}

// Do it
prePprocessVocab();
