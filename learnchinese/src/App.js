import './App.css';
import React from 'react';
import RenderSentence from './RenderSentence.js';
import CharacterToPinYin from './character_to_pinyin.js';
import Button from '@material-ui/core/Button';

import { reactLocalStorage } from 'reactjs-localstorage';

// Require our vocab
const theVocab = require('./vocab.json');

// Remove duplicate words
(() => {
  const seenWords = {};

  for(let i=theVocab.length - 1; i >= 0; --i) {
    const theItem = theVocab[i];
    const theWord = theItem.word;

    if(seenWords.hasOwnProperty(theWord)) {
      theVocab.splice(i, 1);
    }

    seenWords[theWord] = true;
  }
})();

function getAltFormLength(theWord) {
  return theWord.alternative_forms.reduce((currentCount, altForm) => {
    return altForm.example_sentence.length + currentCount;
  }, 0);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSort() {
  if(Math.random() < 0.5) {
    return -1;
  } else {
    return 1;
  }
}

class App extends React.Component {
  constructor() {
    super();
    
    // The save data
    this.theSaveData = reactLocalStorage.getObject('data') || {};
    this.theSaveData.stats = this.theSaveData.stats || {};

    // Init state
    this.state = {
      smartWordCount: 5,
      //currentItemNumber: 0,
    };
    
    this.state.theVocab = theVocab;
    setImmediate(this.sortVocab.bind(this));

    // Load in the vocab
    CharacterToPinYin.loadVocab(this.state.theVocab);

    // Set default item
    //this.state.currentItem = this.state.theVocab[0];

    // Bind up key handler
    //this.keyboardHandler = this.keyboardHandler.bind(this);
    /*this.keyBinds = {};

    this.mappedKeys = {
      ['q'.charCodeAt(0)]: 0,
      ['Q'.charCodeAt(0)]: 0,
      ['w'.charCodeAt(0)]: 0,
      ['W'.charCodeAt(0)]: 0,
      ['e'.charCodeAt(0)]: 0,
      ['E'.charCodeAt(0)]: 0,
      ['r'.charCodeAt(0)]: 0,
      ['R'.charCodeAt(0)]: 0,

      ['u'.charCodeAt(0)]: 1,
      ['U'.charCodeAt(0)]: 1,
      ['i'.charCodeAt(0)]: 1,
      ['I'.charCodeAt(0)]: 1,
      ['o'.charCodeAt(0)]: 1,
      ['O'.charCodeAt(0)]: 1,
      ['p'.charCodeAt(0)]: 1,
      ['P'.charCodeAt(0)]: 1,
      ['['.charCodeAt(0)]: 1,
      ['{'.charCodeAt(0)]: 1,
      [']'.charCodeAt(0)]: 1,
      ['}'.charCodeAt(0)]: 1,
      ['\\'.charCodeAt(0)]: 1,
      ['|'.charCodeAt(0)]: 1,

      ['z'.charCodeAt(0)]: 2,
      ['Z'.charCodeAt(0)]: 2,
      ['x'.charCodeAt(0)]: 2,
      ['X'.charCodeAt(0)]: 2,
      ['c'.charCodeAt(0)]: 2,
      ['C'.charCodeAt(0)]: 2,
      ['v'.charCodeAt(0)]: 2,
      ['V'.charCodeAt(0)]: 2,

      ['n'.charCodeAt(0)]: 3,
      ['N'.charCodeAt(0)]: 3,
      ['m'.charCodeAt(0)]: 3,
      ['M'.charCodeAt(0)]: 3,
      [','.charCodeAt(0)]: 3,
      ['<'.charCodeAt(0)]: 3,
      ['.'.charCodeAt(0)]: 3,
      ['>'.charCodeAt(0)]: 3,
      ['/'.charCodeAt(0)]: 3,
      ['/'.charCodeAt(0)]: 3,
    };*/
  }

  saveData() {
    // Save it
    reactLocalStorage.setObject('data', this.theSaveData);
  }

  /*keyboardHandler(event) {
    if(event.keyCode >= '0'.charCodeAt(0) && event.keyCode <= '9'.charCodeAt(0)) {
      //Do whatever when esc is pressed
      event.preventDefault();

      // Try play sound
      this.playTtsIfUnlocked();
    }

    if(this.mappedKeys.hasOwnProperty(event.keyCode)) {
      let pressRegion = this.mappedKeys[event.keyCode];

      if(this.keyBinds.hasOwnProperty(pressRegion)) {
        this.keyBinds[pressRegion](event);
      }
    }

    // Handle going to next challenge
    if(event.keyCode === ' '.charCodeAt(0)) {
      this.nextChallenge();
    }
  }*/



  playTtsIfUnlocked() {
    const ttsSound = this.getTts();

    if(ttsSound !== null) {
      this.playAudio(ttsSound);
    }
  }

  // componentDidMount(){
  //   document.addEventListener('keydown', this.keyboardHandler, false);
  // }
  // componentWillUnmount(){
  //   document.removeEventListener('keydown', this.keyboardHandler, false);
  // }

  sortVocab() {
    const newVocab = [...this.state.theVocab];

    newVocab.sort((a, b) => {
      // Order by pinyin
      // if(a.pinyinWithoutTone < b.pinyinWithoutTone) {
      //   return -1;
      // }
      // if(a.pinyinWithoutTone > b.pinyinWithoutTone) {
      //   return 1;
      // }

      // if(a.pinyinNumber < b.pinyinNumber) {
      //   return -1;
      // }
      // if(a.pinyinNumber > b.pinyinNumber) {
      //   return 1;
      // }

      // Anything we have learned recently goes to the end
      let statsA = this.theSaveData.stats[a.word];
      let statsB = this.theSaveData.stats[b.word];

      if(statsA || statsB) {
        if(!statsA) {
          return -1;
        } else if(!statsB) {
          return 1;
        } else {
          if(statsA.lastLearned > statsB.lastLearned) {
            return -1;
          } else if(statsA.lastLearned < statsB.lastLearned) {
            return 1;
          }
        }
      }

      // Smaller words first
      if(a.word.length < b.word.length) {
        return -1;
      }

      if(a.word.length > b.word.length) {
        return 1;
      }

      // Smallest sentences
      const altFormLengthA = getAltFormLength(a);
      const altFormLengthB = getAltFormLength(b);
      
      if(altFormLengthA < altFormLengthB) {
        return -1;
      }

      if(altFormLengthA > altFormLengthB) {
        return 1;
      }

      // Least alt forms
      if(a.alternative_forms.length < b.alternative_forms.length) {
        return -1;
      }

      if(a.alternative_forms.length > b.alternative_forms.length) {
        return 1;
      }

      if(a.word < b.word) {
        return -1;
      }

      if(a.word > b.word) {
        return 1;
      }

      // Smallest translation
      if(a.translations.length < b.translations.legth) {
        return -1;
      }
      if(a.translations.length > b.translations.legth) {
        return 1;
      }

      return 0;
    });

    this.setState({
      theVocab: newVocab,
    });
  }

  setItem(itemNumber) {
    this.setState({
      currentItemNumber: itemNumber,
      currentItem: this.state.theVocab[itemNumber],
    });
  }

  changeWord(diff) {
    if(diff === null) {
      this.setState({
        currentItem: null,
      });
      return;
    }

    let newNumber = this.state.currentItemNumber + diff;
    if(newNumber < 0) {
      newNumber = this.state.theVocab.length - 1;
    }

    if(newNumber >= this.state.theVocab.length) {
      newNumber = 0;
    }

    this.setItem(newNumber);
  }

  getPinYinNumberFromItem(theItem) {
    const letterParts = theItem.pinyinWithoutTone.split(' ');
    const numberParts = theItem.pinyinNumber.split(' ');

    if(letterParts.length !== numberParts.length) {
      return 'error number parts dont match';
    }

    const toReturn = [];
    for(let i=0;i<letterParts.length; ++i) {
      toReturn.push(letterParts[i] + numberParts[i]);
    }

    return toReturn.join(' ');
  }

  generateChallenge() {
    // Grab the word we need to do
    let thisWord = this.state.toLearn[this.state.wordNum];

    let currentItem = CharacterToPinYin.fromCharacter(thisWord);

    const correctPinYinText = this.getPinYinNumberFromItem(currentItem);
    const pinyinText = [
      correctPinYinText,
    ];
    const pinyinWithoutToneParts = currentItem.pinyinWithoutTone.split(' ');
    const pinyinNumberParts = currentItem.pinyinNumber.split(' ');

    if(pinyinWithoutToneParts.length !== pinyinNumberParts.length) {
      console.log('parts dont match, wtf!');
      return;
    }

    const seenParts = {
      [pinyinText[0]]: true,
    };

    let maxChallenges = 4;
    while(pinyinText.length < maxChallenges) {
      const ourParts = [];
      for(let j=0; j<pinyinWithoutToneParts.length; ++j) {
        const thisLetter = pinyinWithoutToneParts[j];

        const possiblePart = thisLetter + getRandomInt(1, 4);

        ourParts.push(possiblePart);
      }

      const ourAttempt = ourParts.join(' ');

      if(!seenParts.hasOwnProperty(ourAttempt)) {
        seenParts[ourAttempt] = true;
        pinyinText.push(ourAttempt);
      }
    }

    const theChallenge = {
      correctPinYinText: correctPinYinText,
      pinyinText: pinyinText,

      correctWord: currentItem.word,
      word: [
        currentItem.word
      ],

      correctPinyinWithTone: currentItem.pinyinWithTone,
      correctPinyinWithoutTone: currentItem.pinyinWithoutTone,
      pinyinWithoutTone: [
        currentItem.pinyinWithoutTone
      ],

      correctTranslations: currentItem.translations,
      translations: [
        currentItem.translations
      ],

      correctTts: currentItem.tts,
      tts: [
        currentItem.tts
      ],

      solved: 1,
      solveOrder: this.state.toLearnPhases[this.state.learnPhase],
      // solveOrder: [
      //   'pinyinText',
      //   'word',
      //   'pinyinWithTone',
      //   'translations',
      //   'tts',
      // ],
    };

    const seenWords = {
      [currentItem.word]: true,
    };

    // Grab the word we need to do
    if(this.state.toLearn.length > 1) {
      while(true) {
        const theWord = this.state.toLearn[Math.floor(Math.random() * this.state.toLearn.length)];
        let testItem = CharacterToPinYin.fromCharacter(theWord);

        if(!seenWords.hasOwnProperty(theWord)) {
          seenWords[theWord] = true;
          theChallenge.word.push(theWord);
          theChallenge.pinyinWithoutTone.push(testItem.pinyinWithoutTone);
          theChallenge.translations.push(testItem.translations);
          theChallenge.tts.push(testItem.tts);
          break;
        }
      }
    }

    while(theChallenge.word.length < maxChallenges) {
      const possibleItem = this.state.theVocab[Math.floor(Math.random() * this.state.theVocab.length)];
      const theWord = possibleItem.word;

      if(!seenWords.hasOwnProperty(theWord)) {
        seenWords[theWord] = true;
        theChallenge.word.push(possibleItem.word);
        theChallenge.pinyinWithoutTone.push(possibleItem.pinyinWithoutTone);
        theChallenge.translations.push(possibleItem.translations);
        theChallenge.tts.push(possibleItem.tts);
      }
    }

    // Sort it
    theChallenge.pinyinText.sort(randomSort);
    theChallenge.word.sort(randomSort);
    theChallenge.pinyinWithoutTone.sort(randomSort);
    theChallenge.translations.sort(randomSort);
    theChallenge.tts.sort(randomSort);

    this.setState({
      theChallenge: theChallenge,
      isSolved: false,
      right0: false,
      right1: false,
      right2: false,
      right3: false,
      wrong0: false,
      wrong1: false,
      wrong2: false,
      wrong3: false,
    });

    // Try play audio if it's available
    setTimeout(this.playTtsIfUnlocked.bind(this), 1);
  }

  nextChallenge() {
    // if(!this.state.isSolved) return;

    if(this.state.theChallenge.solved + 1 >= this.state.theChallenge.solveOrder.length) {
      this.nextChallengeMajor();
    } else {
      this.nextChallengePart();
    }
  }

  nextChallengeMajor() {
    if(this.state.hadFailThisRound) {
      // No longer a fail this round
      this.setState({
        hadFailThisRound: false,
        isSolved: false,
        right0: false,
        right1: false,
        right2: false,
        right3: false,
        wrong0: false,
        wrong1: false,
        wrong2: false,
        wrong3: false,
      });

      // Do it again
      setTimeout(this.generateChallenge.bind(this), 1);

      // Stop
      return;
    }

    let learnMode = this.state.learnMode;
    let wordNum = this.state.wordNum + 1;
    let toLearn = [...this.state.toLearn];
    let totalWords = this.state.toLearn.length;
    let hadFail = this.state.hadFail;
    let learnPhase = this.state.learnPhase;

    const newState = {
      hadFailThisRound: false,
      isSolved: false,
      wrong0: false,
      wrong1: false,
      wrong2: false,
      wrong3: false,
    };

    if(learnMode === 0) {
      if(this.state.hadFail > 0) {

        let existingPop = toLearn.splice(wordNum, 1)[0];

        // Randomise puzzles
        toLearn.sort(randomSort);
        toLearn.push(existingPop);
        newState.toLearn = toLearn;
        hadFail = 0;

        // We are back at the second word
        wordNum = 0;
      } else {
        if(wordNum >= totalWords) {
          wordNum = 0;
  
          if(this.state.hadFail > 0) {
            hadFail = 0;
          } else {
            ++learnPhase;
  
            // Randomise the order of the puzzles
            toLearn.sort(randomSort);
            newState.toLearn = toLearn;
  
            if(learnPhase >= this.state.toLearnPhases.length) {
              learnPhase = 0;
              ++learnMode;
              newState.theChallenge = null;
            }
          }
        }
      } 
    }

    newState.learnMode = learnMode;
    newState.wordNum = wordNum;
    newState.totalWords = totalWords;
    newState.hadFail = hadFail;
    newState.learnPhase = learnPhase;

    this.setState(newState);

    if(learnMode === 0) {
      // Generate the challenge based on the current learning objectives defined
      setTimeout(this.generateChallenge.bind(this), 1);
    }

    if(learnMode === 1) {
      window.alert('oh nice! You won something!');

      for(let i=0; i<this.state.toLearn.length; ++i) {
        const thisWordToLearn = this.state.toLearn[i];

        // Ensure we have a store for it
        this.theSaveData.stats[thisWordToLearn] = this.theSaveData.stats[thisWordToLearn] || {
          totalTimesLearned: 0,
        };
        ++this.theSaveData.stats[thisWordToLearn].totalTimesLearned;
        this.theSaveData.stats[thisWordToLearn].lastLearned = new Date();
      }

      // Save data
      this.saveData();

      // Update the sorting of words and such
      this.sortVocab();
    }
  }

  handleSmartNumber(event) {
    this.setState({
      smartWordCount: parseInt(event.target.value)
    });
  }

  doSmartChallenge() {
    const wordList = [
      // Two that we haven't seen for the longest
      this.state.theVocab[this.state.theVocab.length - 1].word,
      //this.state.theVocab[this.state.theVocab.length - 2].word
    ];

    // Add extra until we met the count
    for(let i=0; wordList.length < this.state.smartWordCount; ++i) {
      wordList.push(this.state.theVocab[i].word);
    }

    // Do the challenge
    this.precomputeChallenge(wordList);
  }

  doSpecificChallenge() {
    const currentItem = this.state.currentItem;
    const alternativeForms = currentItem.alternative_forms;
    const challengeParts = {};
    
    for(let i=0; i<alternativeForms.length; ++i) {
      let alternativeForm = alternativeForms[i];

      for(let j=0; j<alternativeForm.tokens.length; ++j) {
          let token = alternativeForm.tokens[j];

          const wordInfo = CharacterToPinYin.fromToken(token);

          if(wordInfo && wordInfo.word) {
            challengeParts[wordInfo.word] = true;
          }
      }
    }

    // Do the challenge
    this.precomputeChallenge(Object.keys(challengeParts));
  }

  precomputeChallenge(wordList) {
    // Random order
    wordList.sort(randomSort);

    this.setState({
      toLearn: wordList,
      learnMode: 0,
      toLearnPhases: [
        [
          'tts',
          'pinyinWithoutTone',
          'pinyinText',
          'translations',
          'word',
        ], [
          'word',
          'pinyinWithoutTone',
          'pinyinText',
          'tts',
          'translations',
        ], [
          'translations',
          'pinyinWithoutTone',
          'pinyinText',
          'tts',
          'word',
        ]
      ],
      learnPhase: 0,
      hadFail: 0,
      wordNum: 0,
    });

    // Generate the challenge based on the current learning objectives defined
    setTimeout(this.generateChallenge.bind(this), 1);
  }

  finishChallenge() {
    this.setState({
      theChallenge: null,
    });
  }

  playAudio(soundFile) {
    new Audio(soundFile).play();
  }

  nextChallengePart() {
    const newTheChallenge = {...this.state.theChallenge};
    ++newTheChallenge.solved;

    this.setState({
      theChallenge: newTheChallenge,
      isSolved: false,
      right0: false,
      right1: false,
      right2: false,
      right3: false,
      wrong0: false,
      wrong1: false,
      wrong2: false,
      wrong3: false,
    });

    // Try play audio if it's available
    setTimeout(this.playTtsIfUnlocked.bind(this), 1);
  }

  onAnswerClicked(toSolve, wasCorrect, theNumber) {
    // Is this the one we are up to?
    if(this.state.theChallenge.solveOrder[this.state.theChallenge.solved] !== toSolve) return;

    if(wasCorrect) {
      this.setState({
        isSolved: true,
        ['right' + theNumber]: true,
      });
    } else {
      this.setState({
        hadFail: this.state.hadFail + 1,
        hadFailThisRound: true,
        ['wrong' + theNumber]: true,
      });
    }
  }

  getKeyCodeText(theNumber) {
    switch(theNumber) {
      case 0:
        return 'Q';

        case 1:
          return 'P';

          case 2:
            return 'Z';

          case 3:
            return 'M';

          default:
            return 'Unknown';
    }
  }

  renderChallengeRow(theChallenge, toSolve, isSolved) {
    return <div key={toSolve}>
      {
        toSolve === 'word' && theChallenge.word.map((word, theNumber) => {
          let className = 'clickable challengeSection';
          const isCorrect = theChallenge.correctWord === word;
          if(!!this.state['right' + theNumber]) {
            className += ' correctAnswer';
          }
          if(!!this.state['wrong' + theNumber]) {
            className += ' wrongAnswer';
          }

          let keyBind = this.onAnswerClicked.bind(this, toSolve, isCorrect, theNumber);
          // this.keyBinds[theNumber] = keyBind;

          return <div key={word} className={className} onClick={keyBind}>
            {
              word
            }
            {/* <br />
            <div>
              {
                this.getKeyCodeText(theNumber)
              }
            </div> */}
          </div>
        })
      }
      {
        toSolve === 'pinyinWithoutTone' && theChallenge.pinyinWithoutTone.map((pinyinWithoutTone, theNumber) => {
          let className = 'clickable challengeSection';
          const isCorrect = theChallenge.correctPinyinWithoutTone === pinyinWithoutTone;
          if(!!this.state['right' + theNumber]) {
            className += ' correctAnswer';
          }
          if(!!this.state['wrong' + theNumber]) {
            className += ' wrongAnswer';
          }

          let keyBind = this.onAnswerClicked.bind(this, toSolve, isCorrect, theNumber);
          // this.keyBinds[theNumber] = keyBind;

          return <div key={pinyinWithoutTone} className={className} onClick={keyBind}>
            {
              pinyinWithoutTone
            }
            {/* <br />
            <div>
              {
                this.getKeyCodeText(theNumber)
              }
            </div> */}
          </div>
        })
      }
      {
        toSolve === 'pinyinText' && theChallenge.pinyinText.map((pinyinText, theNumber) => {
          let className = 'clickable challengeSection';
          const isCorrect = theChallenge.correctPinYinText === pinyinText;
          if(!!this.state['right' + theNumber]) {
            className += ' correctAnswer';
          }
          if(!!this.state['wrong' + theNumber]) {
            className += ' wrongAnswer';
          }

          let keyBind = this.onAnswerClicked.bind(this, toSolve, isCorrect, theNumber);
          // this.keyBinds[theNumber] = keyBind;
          
          return <div key={pinyinText} className={className} onClick={keyBind}>
            {
              pinyinText
            }
            {/* <br />
            <div>
              {
                this.getKeyCodeText(theNumber)
              }
            </div> */}
          </div>
        })
      }
      {
        toSolve === 'translations' && theChallenge.translations.map((translation, theNumber) => {
          let className = 'clickable challengeSection';
          const isCorrect = theChallenge.correctTranslations === translation;
          if(!!this.state['right' + theNumber]) {
            className += ' correctAnswer';
          }
          if(!!this.state['wrong' + theNumber]) {
            className += ' wrongAnswer';
          }

          let keyBind = this.onAnswerClicked.bind(this, toSolve, isCorrect, theNumber);
          // this.keyBinds[theNumber] = keyBind;

          return <div key={translation} className={className} onClick={keyBind}>
            {
              translation
            }
            {/* <br />
            <div>
              {
                this.getKeyCodeText(theNumber)
              }
            </div> */}
          </div>
        })
      }
      {
        toSolve === 'tts' && theChallenge.tts.map((tts, theNumber) => {
          let className = 'challengeSection';
          const isCorrect = theChallenge.correctTts === tts;
          if(!!this.state['right' + theNumber]) {
            className += ' correctAnswer';
          }
          if(!!this.state['wrong' + theNumber]) {
            className += ' wrongAnswer';
          }

          let keyBindAnswer = this.onAnswerClicked.bind(this, toSolve, isCorrect, theNumber);
          let keyBindPlayAudio = this.playAudio.bind(this, tts);

          // let keyBindCheckShift = (event) => {
          //   if(event.shiftKey) {
          //     keyBindAnswer(event);
          //   } else {
          //     keyBindPlayAudio(event);
          //   }
          // };
          // this.keyBinds[theNumber] = keyBindCheckShift.bind(this);

          return <div key={tts} className={className}>
            {
              !isSolved && <div>
                <Button variant="contained" color="primary" onClick={keyBindPlayAudio}>
                  Play Sample
                </Button>
                <Button variant="contained" color="primary" onClick={keyBindAnswer}>
                  Select
                </Button>
                {/* <br />
                <div>
                  Play Sample - 
                  {
                    this.getKeyCodeText(theNumber)
                  }
                </div>
                <div>
                  Answer - Shift + 
                  {
                    this.getKeyCodeText(theNumber)
                  }
                </div> */}
              </div>
            }
          </div>
        })
      }
    </div>
  }

  getHeaderTitle(elementName) {
    switch(elementName) {
      case 'word':
        return 'Character';

      case 'pinyinWithTone':
        return 'Pinyin with Tone';

      case 'pinyinText':
        return 'Pinyin Tone';

      case 'translations':
        return 'Translations';

      case 'tts':
        return 'Audio';
        
      case 'pinyinWithoutTone':
        return 'Pinyin Letter';
      
      default:
        return 'unknown ' + elementName;
    }
  }

  getTts() {
    const theChallenge = this.state.theChallenge;
    if(!!theChallenge) {
      for(let i=0; i<theChallenge.solved && i < theChallenge.solveOrder.length; ++i) {
        let thisChallengeType = theChallenge.solveOrder[i];

        if(thisChallengeType === 'tts') {
          return theChallenge.correctTts;
        }
      }
    }

    return null;
  }

  ttsIsUnlocked() {
    return this.getTts() !== null;
  }

  render() {
    const currentItem = this.state.currentItem;
    const theChallenge = this.state.theChallenge;
    let alternativeForms = [];
    
    if(!!currentItem) {
      alternativeForms = currentItem.alternative_forms;
    }

    const rows = [];

    let unlockedTts = false;
    let unlockedChar = false;
    let unlockedTranslations = false;
    let unlockedLetter = 0;

    if(!!theChallenge) {
      for(let i=0; i<theChallenge.solved && i < theChallenge.solveOrder.length; ++i) {
        let thisChallengeType = theChallenge.solveOrder[i];
        // rows.push(this.renderChallengeRow(theChallenge, thisChallengeType, true));

        if(thisChallengeType === 'tts') {
          unlockedTts = true;
        }

        if(thisChallengeType === 'pinyinWithoutTone') {
          ++unlockedLetter;
        }

        if(thisChallengeType === 'pinyinText') {
          ++unlockedLetter;
        }

        if(thisChallengeType === 'word') {
          unlockedChar = true;
        }

        if(thisChallengeType === 'translations') {
          unlockedTranslations = true;
        }
      }
  
      // Anything to solve?
      if(theChallenge.solved < theChallenge.solveOrder.length) {
        rows.push(this.renderChallengeRow(theChallenge, theChallenge.solveOrder[theChallenge.solved], false));
      }
    }

    return (
      <div className="App">
        {
          !!theChallenge && <div>
            <div>
              <div className="headerKnownInfoTop">
                <span>
                  {
                    this.getHeaderTitle(theChallenge.solveOrder[theChallenge.solved])
                  }
                </span>
              </div>
              <div>
                {
                  (this.state.wordNum + 1) + '/' + (this.state.toLearn.length) + ' '
                }
                {
                  (this.state.hadFail === 0) && 'No Mistakes in this set'
                }
                {
                  (this.state.hadFail === 1) && '1 Mistake in this set'
                }
                {
                  (this.state.hadFail > 1) && (this.state.hadFail + ' Mistakes in this set')
                }
              </div>
              <Button variant="contained" color="secondary" className="stopPuzzleButton" onClick={this.finishChallenge.bind(this)}>Stop Learning</Button>
            </div>
            <div className="positionBottom">
              <div className="headerKnownInfoTop">
                {
                  unlockedChar && <span className="knownInfoTop">
                    {
                      theChallenge.correctWord
                    }
                  </span>
                }
                {
                  unlockedLetter === 1 && <span className="knownInfoTop">
                    {
                      theChallenge.correctPinyinWithoutTone
                    }
                  </span>
                }
                {
                  unlockedLetter === 2 && <span className="knownInfoTop">
                    {
                      theChallenge.correctPinyinWithTone
                    }
                  </span>
                }
                {
                  unlockedLetter === 2 && <span className="knownInfoTop">
                    {
                      theChallenge.correctPinYinText
                    }
                  </span>
                }
                {
                  unlockedTranslations && <span className="knownInfoTop">
                    {
                      theChallenge.correctTranslations
                    }
                  </span>
                }
              </div>
              <div>
                <Button variant="contained" color="primary" className="listenButton" disabled={!unlockedTts} onClick={this.playTtsIfUnlocked.bind(this)}>
                    Play Sound
                  </Button>
              </div>
              {
                rows
              }
              <div>
                <Button variant="contained" color="primary" className="nextPuzzleButton" onClick={this.nextChallenge.bind(this)} disabled={false && theChallenge.solveOrder.length !== theChallenge.solved && !this.state.isSolved}>Next Puzzle</Button>
              </div>
            </div>
          </div>
        }
        {
          !!currentItem && !theChallenge && <div>
            <div>
              <table className="translationTable">
                <tbody>
                  <tr>
                    <th>
                      {
                        this.getHeaderTitle('word')
                      }
                    </th>
                    <td>
                      {
                        currentItem.word
                      }
                    </td>
                  </tr>

                  <tr>
                    <th>
                      {
                        this.getHeaderTitle('pinyinWithTone')
                      }
                    </th>
                    <td>
                      {
                        currentItem.pinyinWithTone
                      }
                    </td>
                  </tr>

                  <tr>
                    <th>
                      {
                        this.getHeaderTitle('pinyinWithTone')
                      }
                    </th>
                    <td>
                      {
                        this.getPinYinNumberFromItem(currentItem)
                      }
                    </td>
                  </tr>

                  <tr>
                    <th>
                      {
                        this.getHeaderTitle('translations')
                      }
                    </th>
                    <td>
                      {
                        currentItem.translations
                      }
                    </td>
                  </tr>

                  <tr>
                    <th>
                      {
                        this.getHeaderTitle('tts')
                      }
                    </th>
                    <td>
                      <Button variant="contained" color="primary" onClick={this.playAudio.bind(this, currentItem.tts)}>Play</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <Button variant="contained" onClick={this.changeWord.bind(this, -1)}>Previous</Button>
              <Button variant="contained" color="secondary" onClick={this.changeWord.bind(this, null)}>Back to Index</Button>
              <Button variant="contained" color="primary" onClick={this.doSpecificChallenge.bind(this)}>Learn it</Button>
              <Button variant="contained" onClick={this.changeWord.bind(this, 1)}>Next</Button>
            </div>
            <div>
              <table className="translationTable">
                <thead>
                  <tr>
                    <th>
                      Chinese
                    </th>
                    <th>
                      Listen
                    </th>
                    <th>
                      English
                    </th>
                  </tr>                  
                </thead>
                <tbody>
                  {
                    alternativeForms.map((alternativeForm) => {
                      return <tr key={alternativeForm.text}>
                        <td>
                          {
                            <RenderSentence text={alternativeForm.text} tokens={alternativeForm.tokens} />
                          }
                        </td>
                        <td>
                          <Button variant="contained" color="primary" onClick={this.playAudio.bind(this, alternativeForm.tts)}>Play</Button>
                        </td>
                        <td>
                          {
                            alternativeForm.translation_text
                          }
                        </td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
        {
          !currentItem && !theChallenge && <div>
            <input type="text" value={this.state.smartWordCount} onChange={this.handleSmartNumber.bind(this)} />
            <Button variant="contained" color="primary" onClick={this.doSmartChallenge.bind(this)}>Smart Lesson</Button>

            <table className="translationTable">
              <thead>
                <tr>
                  <th>
                    {
                      this.getHeaderTitle('word')
                    }
                  </th>
                  <th>
                    {
                      this.getHeaderTitle('pinyinWithTone')
                    }
                  </th>
                  <th>
                    Learn
                  </th>
                  <th>
                    {
                      this.getHeaderTitle('tts')
                    }
                  </th>
                  <th>
                    {
                      this.getHeaderTitle('pinyinText')
                    }
                  </th>
                  <th>
                    {
                      this.getHeaderTitle('translations')
                    }
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.theVocab.map((thisWord, wordCount) => {
                    return <tr key={wordCount}>
                      <td>
                        {
                          thisWord.word
                        }
                      </td>
                      <td>
                        {
                          thisWord.pinyinWithTone
                        }
                      </td>
                      <td>
                        <Button variant="contained" color="primary" onClick={this.setItem.bind(this, wordCount)}>Learn</Button>
                      </td>
                      <td>
                        <Button variant="contained" color="primary" onClick={this.playAudio.bind(this, thisWord.tts)}>Play</Button>
                      </td>
                      <td>
                        {
                          this.getPinYinNumberFromItem(thisWord)
                        }
                      </td>
                      <td>
                        {
                          thisWord.translations
                        }
                      </td>
                    </tr>
                  })
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    );
  }
}

export default App;
