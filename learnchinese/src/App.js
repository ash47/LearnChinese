import './App.css';
import React from 'react';
import RenderSentence from './RenderSentence.js';
import CharacterToPinYin from './character_to_pinyin.js';

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

    // Init state
    this.state = {
      //currentItemNumber: 0,
    };
    
    this.state.theVocab = require('./vocab.json');
    this.sortVocab();

    // Load in the vocab
    CharacterToPinYin.loadVocab(this.state.theVocab);

    // Set default item
    //this.state.currentItem = this.state.theVocab[0];
  }

  sortVocab() {
    this.state.theVocab.sort((a, b) => {
      // Order by pinyin
      if(a.pinyinWithoutTone < b.pinyinWithoutTone) {
        return -1;
      }
      if(a.pinyinWithoutTone > b.pinyinWithoutTone) {
        return 1;
      }

      if(a.pinyinNumber < b.pinyinNumber) {
        return -1;
      }
      if(a.pinyinNumber > b.pinyinNumber) {
        return 1;
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
      pinyinWithTone: [
        currentItem.pinyinWithTone
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
    while(theChallenge.word.length < maxChallenges) {
      const possibleItem = this.state.theVocab[Math.floor(Math.random() * this.state.theVocab.length)];
      const theWord = possibleItem.word;

      if(!seenWords.hasOwnProperty(theWord)) {
        seenWords[theWord] = true;
        theChallenge.word.push(possibleItem.word);
        theChallenge.pinyinWithTone.push(possibleItem.pinyinWithTone);
        theChallenge.translations.push(possibleItem.translations);
        theChallenge.tts.push(possibleItem.tts);
      }
    }

    // Sort it
    theChallenge.pinyinText.sort(randomSort);
    theChallenge.word.sort(randomSort);
    theChallenge.pinyinWithTone.sort(randomSort);
    theChallenge.translations.sort(randomSort);
    theChallenge.tts.sort(randomSort);

    this.setState({
      theChallenge: theChallenge,
    });
  }

  nextChallenge() {
    let learnMode = this.state.learnMode;
    let wordNum = this.state.wordNum + 1;
    let toLearn = [...this.state.toLearn];
    let totalWords = this.state.toLearn.length;
    let hadFail = this.state.hadFail;
    let learnPhase = this.state.learnPhase;

    const newState = {

    };

    if(learnMode === 0) {
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

    newState.learnMode = learnMode;
    newState.wordNum = wordNum;
    newState.totalWords = totalWords;
    newState.hadFail = hadFail;
    newState.learnPhase = learnPhase;

    this.setState(newState);

    console.log(newState);

    if(learnMode === 0) {
      // Generate the challenge based on the current learning objectives defined
      setTimeout(this.generateChallenge.bind(this), 1);
    }

    if(learnMode === 1) {
      window.alert('oh nice! You won something!')
    }
  }

  doChallenge() {
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

    const toLearn = Object.keys(challengeParts);

    this.setState({
      toLearn: toLearn,
      learnMode: 0,
      toLearnPhases: [
        [
          'tts',
          'pinyinText',
          'pinyinWithTone',
          'translations',
          'word',
        ], [
          'word',
          'pinyinWithTone',
          'pinyinText',
          'tts',
          'translations',
        ], [
          'translations',
          'pinyinWithTone',
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

    console.log(toLearn);
  }

  finishChallenge() {
    this.setState({
      theChallenge: null,
    });
  }

  onAnswerClicked(toSolve, wasCorrect) {
    // Is this the one we are up to?
    if(this.state.theChallenge.solveOrder[this.state.theChallenge.solved] !== toSolve) return;

    if(wasCorrect) {
      const newTheChallenge = {...this.state.theChallenge};
      ++newTheChallenge.solved;

      this.setState({
        theChallenge: newTheChallenge,
      });
    } else {
      this.setState({
        hadFail: this.state.hadFail + 1,
      });
    }
  }

  renderChallengeRow(theChallenge, toSolve, isSolved) {
    return <tr key={toSolve}>
      <td>
        {
          this.getHeaderTitle(toSolve)
        }
      </td>
      {
        toSolve === 'word' && theChallenge.word.map((word) => {
          let className = 'clickable';
          const isCorrect = theChallenge.correctWord === word;
          if(isSolved && isCorrect) {
            className += ' solved';
          }
          return <td key={word} className={className} onClick={this.onAnswerClicked.bind(this, toSolve, isCorrect)}>
            {
              word
            }
          </td>
        })
      }
      {
        toSolve === 'pinyinWithTone' && theChallenge.pinyinWithTone.map((pinyinWithTone) => {
          let className = 'clickable';
          const isCorrect = theChallenge.correctPinyinWithTone === pinyinWithTone;
          if(isSolved && isCorrect) {
            className += ' solved';
          }
          return <td key={pinyinWithTone} className={className} onClick={this.onAnswerClicked.bind(this, toSolve, isCorrect)}>
            {
              pinyinWithTone
            }
          </td>
        })
      }
      {
        toSolve === 'pinyinText' && theChallenge.pinyinText.map((pinyinText) => {
          let className = 'clickable';
          const isCorrect = theChallenge.correctPinYinText === pinyinText;
          if(isSolved && isCorrect) {
            className += ' solved';
          }
          return <td key={pinyinText} className={className} onClick={this.onAnswerClicked.bind(this, toSolve, isCorrect)}>
            {
              pinyinText
            }
          </td>
        })
      }
      {
        toSolve === 'translations' && theChallenge.translations.map((translations) => {
          let className = 'clickable';
          const isCorrect = theChallenge.correctTranslations === translations;
          if(isSolved && isCorrect) {
            className += ' solved';
          }
          return <td key={translations} className={className} onClick={this.onAnswerClicked.bind(this, toSolve, isCorrect)}>
            {
              translations
            }
          </td>
        })
      }
      {
        toSolve === 'tts' && theChallenge.tts.map((tts) => {
          let className = null;
          const isCorrect = theChallenge.correctTts === tts;
          if(isSolved && isCorrect) {
            className = 'solved';
          }
          return <td key={tts} className={className}>
            <audio controls>
              <source src={tts} type="audio/ogg" />
            </audio>
            {
              !isSolved && <div>
                <button onClick={this.onAnswerClicked.bind(this, toSolve, isCorrect)}>
                  select
                </button>
              </div>
            }
          </td>
        })
      }
    </tr>
  }

  getHeaderTitle(elementName) {
    switch(elementName) {
      case 'word':
        return 'Character';

      case 'pinyinWithTone':
        return 'Pinyin with Tone';

      case 'pinyinText':
        return 'Pinyin with Tone Number';

      case 'translations':
        return 'Translations';

      case 'tts':
        return 'Audio';
      
      default:
        return 'unknown ' + elementName;
    }
  }

  render() {
    const currentItem = this.state.currentItem;
    const theChallenge = this.state.theChallenge;
    let alternativeForms = [];
    
    if(!!currentItem) {
      alternativeForms = currentItem.alternative_forms;
    }

    const rows = [];

    if(!!theChallenge) {
      for(let i=0; i<theChallenge.solved && i < theChallenge.solveOrder.length; ++i) {
        rows.push(this.renderChallengeRow(theChallenge, theChallenge.solveOrder[i], true));
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
            <table className="translationTable">
              <tbody>
                {
                  rows
                }
              </tbody>
            </table>
            <div>
              <button onClick={this.finishChallenge.bind(this)}>Stop Learning</button>
              <button onClick={this.nextChallenge.bind(this)} disabled={false && theChallenge.solveOrder.length !== theChallenge.solved}>Next Challenge</button>
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
                      <audio key={currentItem.tts} controls>
                        <source src={currentItem.tts} type="audio/ogg" />
                      </audio>
                    </td>
                  </tr>
                </tbody>
              </table>
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
                          <audio key={alternativeForm.tts} controls>
                            <source src={alternativeForm.tts} type="audio/ogg" />
                          </audio>
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
            <div>
              <button onClick={this.changeWord.bind(this, -1)}>Previous</button>
              <button onClick={this.changeWord.bind(this, null)}>Back to Index</button>
              <button onClick={this.doChallenge.bind(this)}>Learn it</button>
              <button onClick={this.changeWord.bind(this, 1)}>Next</button>
            </div>
          </div>
        }
        {
          !currentItem && !theChallenge && <div>
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
                    {
                      this.getHeaderTitle('pinyinWithTone')
                    }
                  </th>
                  <th>
                    {
                      this.getHeaderTitle('translations')
                    }
                  </th>
                  <th>
                    {
                      this.getHeaderTitle('tts')
                    }
                  </th>
                  <th>
                    Learn
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
                        {
                          this.getPinYinNumberFromItem(thisWord)
                        }
                      </td>
                      <td>
                        {
                          thisWord.translations
                        }
                      </td>
                      <td>
                        <audio key={thisWord.tts} controls>
                          <source src={thisWord.tts} type="audio/ogg" />
                        </audio>
                      </td>
                      <td>
                        <button onClick={this.setItem.bind(this, wordCount)}>Learn</button>
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