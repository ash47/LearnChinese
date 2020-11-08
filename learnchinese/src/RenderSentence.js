import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import CharacterToPinYin from './character_to_pinyin.js';

export default class RenderSentence extends React.Component {
    tryPlaySound(wordInfo) {
        if(wordInfo) {
            new Audio(wordInfo.tts).play();
        }
    }

    render() {
        

        return <div>
            {
                this.props.tokens.map((token, tokenIndex) => {
                    const wordInfo = CharacterToPinYin.fromCharacter(token.value);

                    let classNameCanClick = "";
                    if(!!wordInfo) {
                        classNameCanClick = "clickable";
                    }

                    return <Tooltip key={tokenIndex} className={classNameCanClick} onClick={this.tryPlaySound.bind(this, wordInfo)} title={
                        <table className="translationTableTooltip">
                            {
                                !!token.hint_table && !!token.hint_table.headers && <thead>
                                    <tr>
                                        {
                                            token.hint_table.headers.map((tokenHeader, tokenHeaderIndex) => {
                                                let theClassname = "";
                                                if(tokenHeader.selected) {
                                                    theClassname = "selectedTranslation";
                                                }

                                                return <th key={tokenHeaderIndex} className={theClassname}>
                                                    {
                                                        tokenHeader.token
                                                    }
                                                </th>
                                            })
                                        }
                                    </tr>
                                </thead>
                            }
                            {
                                !!token.hint_table && !!token.hint_table.rows && <tbody>
                                    {
                                        token.hint_table.rows.map((tokenRow, tokenRowIndex) => {
                                            return <tr key={tokenRowIndex}>
                                                {
                                                    tokenRow.cells.map((tokenCell, tokenCellIndex) => {
                                                        return <td key={tokenCellIndex} colspan={tokenCell.colspan}>
                                                            {
                                                                tokenCell.hint
                                                            }
                                                        </td>
                                                    })
                                                }
                                            </tr>
                                        })
                                    }
                                </tbody>
                            }
                            
                        </table>
                    }>
                        <div className="translationTooltipPart">
                            <div>
                                {
                                    token.value
                                }
                            </div>
                            <div>
                            {
                                    !!wordInfo && wordInfo.pinyinWithTone
                                }
                                {
                                    !wordInfo && <div>
                                        &nbsp;
                                    </div>
                                }
                            </div>
                        </div>
                    </Tooltip>
                })
            }
        </div>
    }
}
