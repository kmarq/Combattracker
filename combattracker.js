/* 
 * Version 1.0.13 Beta
 * Made By Robin Kuiper
 * Changes in Version 0.2.1 by The Aaron
 * Changes in Version 0.2.8, 0.2.81, 0.2.82 by Victor B
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * My Discord Server: https://discord.gg/AcC9VMEG
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Roll20 Thread: https://app.roll20.net/forum/post/6349145/script-combattracker
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/
var CombatTracker = CombatTracker || (function() {
    'use strict';

    let round = 1,
	    version = '1.0.13 Beta',
        timerObj,
        intervalHandle,
        debug = true,
        rotationInterval,
        paused = false,
        observers = {
            tokenChange: []
        },
		whisper, handled = [],	
        extensions = {
            StatusInfo: true // This will be set to true automatically if you have StatusInfo
        },
        startImage = '4',
		pauseImage = '5',
        stopImage = '6',
        tagImage = '3',
        noTagImage = 'd',
        deleteImage = 'D',
        shuffleImage = ';',
        randomSingleImage = '`',
        randomLoopImage = '?',
        togetherImage = 'J',
        loopImage = 'r',
        singleImage = '1',
        lockImage = ')',
        unlockImage = '(',
        backImage = 'y',
        nextImage = ']',
        prevImage = '[',
        decreaseImage = '<',
        increaseImage = '>',
        timerImage = 't',
        favoriteImage = 'S',
        allConditionsImage = 'G',
        addImage = '&',		
        doneImage = '3',
        delayImage = '}';

    //Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
 		title: 'font-size:14px;font-weight:bold',
 		version:'font-size:10px;',
 		header: 'margin-top:10px;margin-bottom:5px;font-weight:bold;font-style:italic;display:inline-block;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;width:100%',
        textButton: 'background-color:#fff; color: #000; text-align: center; float: right;',
 		linkButton: 'background-color:#fff; color: #000; text-align: center;vertical-align:middle',
 		textLabel: 'float:left;text-align:center;margin-top:8px',
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough'
    },
    // Styling for the chat responses.
    style = "overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    buttonStyle = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center; float: right;",
    conditionStyle = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    conditionButtonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0",
    listStyle = 'list-style: none; padding: 0; margin: 0;',

    icon_image_positions = {red:"#C91010",blue:"#1076C9",green:"#2FC910",brown:"#C97310",purple:"#9510C9",pink:"#EB75E1",yellow:"#E5EB75",dead:"X",skull:0,sleepy:34,"half-heart":68,"half-haze":102,interdiction:136,snail:170,"lightning-helix":204,spanner:238,"chained-heart":272,"chemical-bolt":306,"death-zone":340,"drink-me":374,"edge-crack":408,"ninja-mask":442,stopwatch:476,"fishing-net":510,overdrive:544,strong:578,fist:612,padlock:646,"three-leaves":680,"fluffy-wing":714,pummeled:748,tread:782,arrowed:816,aura:850,"back-pain":884,"black-flag":918,"bleeding-eye":952,"bolt-shield":986,"broken-heart":1020,cobweb:1054,"broken-shield":1088,"flying-flag":1122,radioactive:1156,trophy:1190,"broken-skull":1224,"frozen-orb":1258,"rolling-bomb":1292,"white-tower":1326,grab:1360,screaming:1394,grenade:1428,"sentry-gun":1462,"all-for-one":1496,"angel-outfit":1530,"archery-target":1564},
    markers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-bomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],
    shaped_conditions = ['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'],
	
    script_name = 'CombatTracker',
    combatState = 'COMBATTRACKER',
    statusState = 'STATUSINFO',

    handleInput = (msg) => {

        if (msg.content.indexOf('!ct')!==0 && msg.content.indexOf('!condition')!==0) {
            return;
        }
		
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();
        
        if (debug) {
            log(args)
            log(command)
            log(extracommand)
        }
        
        if (command === state[combatState].config.command) {
            log('In Combat Tracker')
			if (extracommand === 'next') {
				if (!getTurnorder().length) return;

				if(playerIsGM(msg.playerid) || msg.playerid === 'api'){
					NextTurn();
					return;
				}
			}
			if (extracommand === 'delay') {
				if (!getTurnorder().length) return;

				if(playerIsGM(msg.playerid) || msg.playerid === 'api'){
					delayTurn();
					return;
				}
			}
			
			// Below commands are only for GM's
			if (!playerIsGM(msg.playerid)) return;

			switch (extracommand) {
				case 'reset':
						state[combatState] = {};
						state[statusState] = {};
						setDefaults(true);
						sendConfigMenu();
				break;
				case 'config':
					editCombatState(args)              
				break;
				case 'tracker':
					sendConfigMenu();
				break;				
				case 'sort':
					sortTurnorder();
				break;
				case 'prev':
					PrevTurn();
				break;
				case 'start':
					startCombat(msg.selected, args);
				break;
				case 'stop':
					stopCombat();
					if(args.shift() === 'b') sendTrackerMenu();
				break;
				case 'st':
					stopTimer();
					if(args.shift() === 'b') sendTrackerMenu();
				break;
				case 'pt':
					pauseTimer();
					if(args.shift() === 'b') sendTrackerMenu();
				break;
				case 'all':
					editFavoriteState('All');
					if(args.shift() === 'b') sendTrackerMenu();
				break;	
				case 'fav':
					editFavoriteState('Favorites');
					if(args.shift() === 'b') sendTrackerMenu();
				break;						
				case 'add':
				    addCommand(msg, args)
				break;    
				case 'remove': {
					removeCommand(msg, args)
				}
				break;
                case 'show': {
                    showConditions(msg.selected, (args.shift() === 'p'));
    			}
                break;				
				default:
				    log('default')
					sendTrackerMenu();
				break;
			}
		}	
		
        if (command === state[statusState].config.command) {
            switch(extracommand) {
                
                case 'import':
                    importConditions(args, msg)
                break;
                case 'export':
                    exportConditions()

                break;                
                case 'config':
                    if(args.length > 0){
                          editStatusState(args)
                    } else {
                        sendStatusMenu()
                    }
                break;
                case 'config-conditions':
                    let condition = args.shift();

                    if (debug) {
                        log('Conditions Config')
                        log('Condition Key:'+condition)
                    }
                    
                    if(condition === 'add'){
						createCondition(condition)
                    } else if (condition === 'remove'){
						deleteCondition(condition)
                    } else if (state[statusState].conditions[condition]) {
						editCondition(args, condition)
                    } else {
						sendConditionsMenu();
					}	
                break;
                case 'favorite':
                    editFavoriteConditon(args)
                break;
                default:
                break;
            }
        }		
    },

    importConditions = (args, msg) => {
        let json;
        let conditions = msg.content.substring(('!condition import ').length);
        
        try{
            json = JSON.parse(conditions);
        } catch(e) {
            makeAndSendMenu('This is not a valid JSON string.');
            return;
        }
        
        state[statusState] = json;
        
        state[statusState].conditions.forEach(condition => {
            if(!condition.hasOwnProperty('duration')) {
                condition.duration = 1
            }
            if(!condition.hasOwnProperty('direction')) {
                condition.direction = -1
            }            
            if(!condition.hasOwnProperty('override')) {
                condition.override = false
            }            
        }) 
    },
    
    exportConditions = () => {
        makeAndSendMenu('<pre>'+HE(JSON.stringify(state[statusState]))+'</pre><p>Copy the entire content above and save it on your pc.</p>');
    },
    
    //this
    addCommand = (msg, args) => {
        let	name        = args.shift().toLowerCase(),
            duration    = args.shift() || 0,
            direction   = args.shift() || 0,
            message     = args.join(' ')

        if (debug) {
            log('Add Command')
            log('Name:' + name)
            log('Duration:' + duration)
            log('Direction:' + direction)
            log('Message:'+ message)            
        }
        //loop through selected tokens
        if (msg.selected) {
        	msg.selected.forEach(select => {
                if (debug) {
                    log('ID:' + select._id)
                    log('Type:' + select._type)
                } 
        	    //call add condition passint ing token, name and other parameters
        	    if (select._type == 'graphic') {
    			    addCondition(getObj(select._type, select._id), name, duration, direction, message)    
        	    }
        	        
        	});	 	
        } else {
            makeAndSendMenu('No tokens were selected.', '', 'gm');
        }   
    },
  
     removeCommand = (msg, args) => {
        let	name        = args.shift().toLowerCase()

        if (debug) {
            log('Remove Command')
            log('Name:' + name)
        }
        
        //loop through selected tokens
        if (msg.selected) {
        	msg.selected.forEach(select => {
                if (debug) {
                    log('ID:' + select._id)
                    log('Type:' + select._type)
                } 
        	    //call add condition passint ing token, name and other parameters
        	    if (select._type == 'graphic') {
    			    removeCondition(getObj(select._type, select._id), name)    
        	    }    
        	});	 	
        }	
    },
       
    addCondition = (token, name, duration, direction, message) => {
	    let	defaultCondition, combatCondition, newCondition = {}

        if (debug) {
            log('Add Condition')
            log('Token:' + token.get("_id"))
            log('Name:'+name)
        } 
	        
	    //verify incomming command     
        if (verifyCondition(token.get("_id"), name)) {
            //remove existing condition on token
            removeCondition(token, name);   
            //setup the new condition from input and get the defaults
            defaultCondition    = getConditionByKey(name)
            //default values.  If override is false then also use default values
            newCondition.id     = token.get("_id")
            newCondition.name   = defaultCondition.name.toLowerCase()
            newCondition.icon   = defaultCondition.icon
            
            if (defaultCondition.override && duration) {
                newCondition.duration = parseInt(duration)
            }
            if (defaultCondition.override && direction) {
                newCondition.direction = parseInt(direction)
            }
            //name is used within combat state to compare against in coming requests.  Needs to be lower case
            if (debug) {
                log('Duration:' + newCondition.duration)
                log('Direction:' + newCondition.direction)
            }    
            //push condition to combattracker
            state[combatState].conditions.push(newCondition)
            //set icon on token
            if (newCondition.name == 'dead' || newCondition.duration <= 1) {
                token.set('status_'+newCondition.icon, true);
            } else {   
                if (newCondition.duration >= 10) {
                    token.set('status_'+newCondition.icon, true);
                } else {
                    token.set('status_'+newCondition.icon,newCondition.duration);
                }
            }  
            
            if (state[statusState].config.showConditions) {
                sendConditionToChat(defaultCondition)
            }    
            if (debug) {
                log('Combat Conditions')
                state[combatState].conditions.forEach(condition => {
                    log(condition)
                })
            } 
        }    
    },

    removeCondition = (token, name) => {
        let i, condition
        
        if (debug) {
            log('Remove Condition')
            log('Name:'+name)
        } 

        if (state[combatState].conditions.length > 0) {
            state[combatState].conditions.forEach((condition, i) => {
                if (condition.name.toLowerCase() == name &&  condition.id == token.get("_id")) {
                    state[combatState].conditions.splice(i, 1);
                    token.set('status_'+condition.icon, false);   
                }
            })
        }  
        if (debug) {
            log('Combat Conditions')
            state[combatState].conditions.forEach(condition => {
                log(condition)
            })
        }         
    },
    
    verifyCondition  = (tokenID, name)  => {
        //must have a name
		if (!name) {
			makeAndSendMenu('No condition name was given.', '', 'gm');
			return false;
		}
		//must have a token		
		if (!tokenID || !tokenID.length) {		
			makeAndSendMenu('No tokens were selected.', '', 'gm');
			return false;
        }	

        if (tokenID == getOrCreateMarker().get('id')) {
            return false;
        }
          if (tokenID == getOrCreateMarker(true).get('id')) {
            return false;
        }      
        return true;
    },

    strip = (str) => {
        return str.replace(/[^a-zA-Z0-9]+/g, '_');
    },

    startCombat = (selectedTokens, args) => {
        let verified=false, statusmarkers
        
        if (debug) {
            log('Start Combat')
        }
        
        verified = verifySetup(selectedTokens)
        
        if (!verified) {
            return;
        }
        
        paused = false;
        resetMarker();
        
        Campaign().set('initiativepage', Campaign().get('playerpageid'));

        if(state[combatState].config.turnorder.throw_initiative){
            rollInitiative(selectedTokens);
        }

        sendTrackerMenu();
        doTurnorderChange();
    },
    
    stopCombat = () => {
        let token, statusmarkers
        if (debug) {
            log('Stop Combat')
        }
        
        if(timerObj) timerObj.remove();

        state[combatState].conditions.forEach((condition,i) => {
            log(condition)
            log(getOrCreateMarker().get('id'))
            if (condition.id != getOrCreateMarker().get('id')) {
                token           = getObj('graphic', condition.id)
                token.set('status_'+condition.icon, false); 
                
            }  
        }) 
        state[combatState].conditions = [];
        removeMarkers();
        stopTimer();
        paused = false;
        Campaign().set({
            initiativepage: false,
            turnorder: ''
        });
        state[combatState].turnorder = {};
        round = 1;
   
    },
    
    verifySetup = (selectedTokens) => {
        let initAttributes, attribute, whisper, character, verified=true, i, tokenObj
 
        if (!selectedTokens || selectedTokens.length == 0) {
            makeAndSendMenu('No tokens selected.  Combat not started',' ', whisper);   
            verified=false             
            return
        }

        selectedTokens.forEach(token => {

            if (token._type == 'graphic') {
                tokenObj        = getObj('graphic', token._id)
                whisper         = (tokenObj.get('layer') === 'gmlayer') ? 'gm ' : ''
                character       = getObj('character', tokenObj.get('represents'))
                initAttributes  = state[combatState].config.initiative_attribute_name.split(',')

                if (typeof character == 'undefined') {
                    makeAndSendMenu('A token was found not assigned to a character sheet',' ', whisper);   
    //                verified=false
                }
    
                for (i=0;i<initAttributes.length;i++) {
                    if (typeof character != 'undefined') {
                        attribute    = getAttrByName(character.id,initAttributes[i],'current') 
                        if (typeof attribute == 'undefined') {
                            makeAndSendMenu('Initiative Attribute ' + initAttributes[i] + ' not found on character sheet',' ', whisper);  
                            verified=false
                        }    
                    }    
                } 
            }    
        })    
        
        return verified
    },

    resetMarker = (next=false) => {
        let marker = getOrCreateMarker(next);
        
        if (debug) {
            log('Reset Marker')
        }
        marker.set({
            name: (next) ? 'NextMarker' : 'Round ' + round,
            imgsrc: (next) ? state[combatState].config.next_marker_img : state[combatState].config.marker_img,
            pageid: Campaign().get('playerpageid'),
            layer: 'gmlayer',
            left: 35, top: 35,
            width: 70, height: 70
        });

        return marker;
    },

    getOrCreateMarker = (next=false, pageid=Campaign().get('playerpageid')) => {
        let marker, markers,
            imgsrc = (next) ? state[combatState].config.next_marker_img : state[combatState].config.marker_img

        // if (debug) {
        //     log('Get or Create Marker')
        // }
        
        if (next) {
            markers = findObjs({
                pageid,
                imgsrc,
                name: 'NextMarker'
            });

        } else {
            markers = findObjs({
                pageid,
                imgsrc
            });
        }
        
        markers.forEach((marker, i) => {
            if(i > 0 && !next && marker.get('name') !== 'NextMarker') marker.remove();
        });

        marker = markers.shift();
        
        // if (debug) {
        //     log('Marker:' + marker)
        // }
        
        if(!marker) {
            marker = createObj('graphic', {
                name: (next) ? 'NextMarker' : 'Round 0',
                imgsrc,
                pageid,
                layer: 'gmlayer',
                showplayers_name: true,
                left: 35, top: 35,
                width: 70, height: 70
            });
        }
        
        if(!next) checkMarkerturn(marker);
        
        toBack(marker);

        return marker;
    },
    
    inFight = () => {
        return (Campaign().get('initiativepage') !== false);
    },

    rollInitiative = (selectedTokens) => {
        let tokenObj, whisper, initiativeTemp, initiativeRoll, characterObj, initAttributes, initiativeMod, i, advantageAttrib, initiativeAdv1, initiativeAdv2
        
        //loop through selected tokens
        selectedTokens.forEach(token => {
            if (token._type == 'graphic') {
                // get token and character objects
                tokenObj        = getObj('graphic', token._id)
                characterObj    = getObj('character', tokenObj.get('represents'))
                // roll initiative only for tokens assigned to character sheets
                if (typeof characterObj != 'undefined') {
                    whisper         = (tokenObj.get('layer') === 'gmlayer') ? 'gm ' : ''
                    initiativeRoll  = (state[combatState].config.turnorder.ini_die) ? randomInteger(state[combatState].config.turnorder.ini_die) : 0;
                    initAttributes  = state[combatState].config.initiative_attribute_name.split(',')
                    initiativeMod   = 0
                    // loop through commma delimited list of attributes (usually only one) to determine the initiative modifier
                    for (i=0;i<initAttributes.length;i++) {
                        initiativeTemp  = getAttrByName(characterObj.id,initAttributes[i],'current') 
                        initiativeMod  += parseFloat(initiativeTemp)
                    }
                    //check for advantage initiative rolling (OGL)
                    advantageAttrib   = getAttrByName(characterObj.id, 'initiative_style', 'current');  
                    if (typeof advantageAttrib != 'undefined') {
                        // roll advantage for initiative
                        initiativeAdv1 = (state[combatState].config.turnorder.ini_die) ? randomInteger(state[combatState].config.turnorder.ini_die) : 0; 
                        initiativeAdv2 = (state[combatState].config.turnorder.ini_die) ? randomInteger(state[combatState].config.turnorder.ini_die) : 0;
                        // this is the value if in OGL if rolling advantage
                        if (advantageAttrib == '{@{d20},@{d20}}kh1') {
                            //determine which value is higher
                            if (initiativeAdv1 >= initiativeAdv2) {
                                initiativeRoll = initiativeAdv1
                            } else {
                                initiativeRoll = initiativeAdv2
                            }
                            //pass in both values and modifier for display
                            if (state[combatState].config.turnorder.show_initiative_roll) {
                                sendInitiativeChat(tokenObj.get('name'),initiativeAdv1,initiativeMod,initiativeAdv2,whisper)                            
                            }
                        } else if (state[combatState].config.turnorder.show_initiative_roll) { 
                            // if not rolling advantage, use first roll
                            initiativeRoll = initiativeRoll1
                            sendInitiativeChat(tokenObj.get('name'),initiativeRoll1,initiativeMod,null,whisper)                              
                        }    
                    }  else if (state[combatState].config.turnorder.show_initiative_roll) { 
                        // if everything else then pass in for display
                         sendInitiativeChat(tokenObj.get('name'),initiativeRoll,initiativeMod,null,whisper)   
                    }  
                    //add to turnorder 
                    if (debug) {
                        log("Token Id:" + tokenObj.id)
                        log("Token Page:" + tokenObj.get("pageid"))
                    }    
                    addToTurnorder({id:tokenObj.id,pr:initiativeMod+initiativeRoll,custom:'',pageid:tokenObj.get("pageid")});
                }   
            }    
        });
        // sort turnorder if set
        if(state[combatState].config.turnorder.auto_sort){
            sortTurnorder();
        }
    },

    sendInitiativeChat = (name,rollInit,bonus,rollInit1,whisper) => { 
        let contents = ''
        
        if (rollInit1) {
            contents = '<table style="width: 50%; text-align: left; float: left;"> \
                            <tr> \
                                <th>Modifier</th> \
                                <td>'+bonus+'</td> \
                            </tr> \
                        </table> \
                        <div style="text-align: center"> \
                            <b style="font-size: 14pt;"> \
                                <span style="border: 1px solid green; padding-bottom: 2px; padding-top: 4px;">[['+rollInit+'+'+bonus+']]</span><br><br> \
                            </b> \
                        </div> \
                        <div style="text-align: center"> \
                            <b style="font-size: 10pt;"> \
                                <span style="border: 1px solid red; padding-bottom: 2px; padding-top: 4px;">[['+rollInit1+'+'+bonus+']]</span><br><br> \
                            </b> \
                        </div>'   
        } else {
             contents = '<table style="width: 50%; text-align: left; float: left;"> \
                            <tr> \
                                <th>Modifier</th> \
                                <td>'+bonus+'</td> \
                            </tr> \
                        </table> \
                        <div style="text-align: center"> \
                            <b style="font-size: 14pt;"> \
                                <span style="border: 1px solid green; padding-bottom: 2px; padding-top: 4px;">[['+rollInit+'+'+bonus+']]</span><br><br> \
                            </b> \
                        </div>'
           
        }  
        
        makeAndSendMenu(contents, name + ' Initiative', whisper);    
    },

    clearTurnorder = () => {
        Campaign().set({ turnorder: '' });
        state[combatState].turnorder = {};
    },

    removeMarkers = () => {
        stopRotate();
        getOrCreateMarker().remove();
        getOrCreateMarker(true).remove();
    },

    doTurnorderChange = (prev=false, delay=false) => {
        //if(!Campaign().get('initiativepage') || getTurnorder().length <= 1) return;

        let turn = getCurrentTurn();
        
        if(debug) {
            log('Turn Order Change')
            log('ID:' + turn.id)
        }
        if (turn.id === '-1') { 
            if (turn.formula) {
                updatePR(turn, parseInt(turn.formula));
            }
            if (!state[combatState].config.turnorder.skip_custom) {
                resetMarker();
            } else {
                NextTurn();
            }    
            return;
        }
        
        if (turn.id === getOrCreateMarker().get('id')) {
            if (prev) {
                PrevRound();
            } else { 
                NextRound();
            }    
            return;
        }

        let token = getObj('graphic', turn.id);

		if (token) {
            toFront(token);

            if (state[combatState].config.timer.use_timer) {
                startTimer(token);
            }

            changeMarker(token || false);

            if (state[combatState].config.macro.run_macro) {
                let ability = findObjs({ _characterid: token.get('represents'), _type: 'ability', name: state[combatState].config.macro.macro_name })
                if(ability && ability.length){
                    sendChat(token.get('name'), ability[0].get('action'), null, {noarchive:true} );
                }
            }

            if (state[combatState].config.announcements.announce_turn) {
                announcePlayer(token, (token.get('layer') === 'objects') ? '' : 'gm', prev, delay);
                //announcePlayer(token || turn.custom, (token.get('layer') === 'objects') ? '' : 'gm');
            }
            
            Pull(token);
            doFX(token);
        } else {
            resetMarker();
        }

        if (state[combatState].config.next_marker) {
            let nextTurn = getNextTurn();
            let nextToken = getObj('graphic', nextTurn.id);

            if (nextToken) {
                toFront(nextToken);
                changeMarker(nextToken || false, true);
            } else {
                resetMarker(true);
            }
        }
    },

    updatePR = (turn, modifier) => {
        let turnorder = getTurnorder();

        turnorder.forEach((t, i) => {
            if(turn.id === t.id && turn.custom === t.custom){
                turnorder[i].pr = parseInt(t.pr) + modifier;
            }
        });

        setTurnorder(turnorder);
    },

    doFX = (token) => {
        if(!state[combatState].config.announcements.use_fx || token.get('layer') === 'gmlayer') return;

        let pos = {x: token.get('left'), y: token.get('top')};
        spawnFxBetweenPoints(pos, pos, state[combatState].config.announcements.fx_type, token.get('pageid'));
    },

    Pull = (token) => {
        if(!state[combatState].config.pull) return;

        sendPing(token.get('left'), token.get('top'), token.get('pageid'), null, true);
    },

    startTimer = (token) => {
        paused = false;
        clearInterval(intervalHandle);
        if(timerObj) timerObj.remove();

        let config_time = parseInt(state[combatState].config.timer.time); 
        let time = config_time;

        if(token && state[combatState].config.timer.token_timer){
            timerObj = createObj('text', {
                text: 'Timer: ' + time,
                font_size: state[combatState].config.timer.token_font_size,
                font_family: state[combatState].config.timer.token_font,
                color: state[combatState].config.timer.token_font_color,
                pageid: token.get('pageid'),
                layer: 'gmlayer'
            });
        }

        intervalHandle = setInterval(() => {
            if(paused) return;

            if(timerObj) timerObj.set({
                top: token.get('top')+token.get('width')/2+40,
                left: token.get('left'),
                text: 'Timer: ' + time,
                layer: token.get('layer')
            });

            if(state[combatState].config.timer.chat_timer && (time === config_time || config_time/2 === time || config_time/4 === time || time === 10 || time === 5)){
                makeAndSendMenu('', 'Time Remaining: ' + time);
            }

            if(time <= 0){
                if(timerObj) timerObj.remove();
                clearInterval(intervalHandle);
                if(state[combatState].config.timer.auto_skip) NextTurn();
                else if(token.get('layer') !== 'gmlayer') makeAndSendMenu(token.get('name') + "'s time ran out!", '');
            }

            time--;
        }, 1000);
    },

    stopTimer = () => {
        clearInterval(intervalHandle);
        if(timerObj) timerObj.remove();
    },

    pauseTimer = () => {
        paused = !paused;
    },

    announcePlayer = (token, target, prev, delay=false, show) => {
        let name, imgurl, conditions, image, doneButton, delayButton, contents;

        target      = (state[combatState].config.announcements.whisper_turn_gm) ? 'gm' : target;
        name        = token.get('name');
        imgurl      = token.get('imgsrc');
        conditions  = getAnnounceConditions(token, prev, delay, show);
        image       = (imgurl) ? '<img src="'+imgurl+'" width="50px" height="50px"  />' : ''
        name        = (state[combatState].config.announcements.handleLongName) ? handleLongString(name) : name
        
        if (!show) {
            doneButton  = makeImageButton('!ct next',doneImage,'Done with Round','transparent',18)
            delayButton = makeImageButton('!ct delay',delayImage,'Delay your Turn','transparent',18);
        }    

        contents    = '<div style="display:inline-block;vertical-aligh:middle">'+image+'</div>'
        if (!show) {
            contents   += '<div style="display:inline-block;vertical-aligh:middle">'+name+'\'s Turn</div>'
        } else {
            contents   += '<div style="display:inline-block;vertical-aligh:middle">'+name+'</div>'
        }
        
        if (!show) {
            contents   += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+doneButton+'</div>'
            contents   += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+delayButton+'</div>'
        }
        
        if (state[combatState].config.announcements.announce_turn) {
            contents   += conditions
        }
        //send announcement
        makeAndSendMenu(contents, '', target);
    },

    getAnnounceConditions = (token, prev, delay, show) => {
        let output = ' ', removeButton
        
        if (debug) {
            log('Announce Condition') 
            log('Token ID:' + token.get("_id"))
        }

        removeButton  = makeImageButton('!ct remove',deleteImage,'Remove Condition','transparent',18)
        
        state[combatState].conditions.forEach(condition => {
            
            if (condition.id ==  token.get("_id")) {
                output  +=  '<div>'
                
                if (debug) {
                    log('Condition:' +condition.name)
                    log('Duration:' +condition.duration)
                    log('Direction:' +condition.direction)
                }            
                
                if (!delay && !show) {
                    if (!prev) {
                        condition.duration = condition.duration + condition.direction
                    } else {
                        condition.duration = condition.duration - condition.direction
                    }
                }    
                
                if (condition.duration == 0 && condition.direction != 0) {
                    output += '<strong>'+condition.name+'</strong> removed.';
                    if (!delay && !show) {
                        removeCondition(token, condition.name);  
                    }    
                } else if (condition.duration > 0 && condition.direction != 0) {
                    if (show) {
                        output += '<strong>'+makeButton(condition.name, '!ct remove '+condition.name)+'</strong>:'+condition.duration+' Rounds Left'
                    } else {
                        output += '<strong>'+condition.name+'</strong>: '+condition.duration+' Rounds Left';
                    }
                    
                    if (!delay && !show) {
                        if (condition.duration >= 10) {                
                            token.set('status_'+condition.icon, true);
                        } else {
                            token.set('status_'+condition.icon, condition.duration);
                        }   
                    }    
                } else if (condition.direction == 0) {
                    if (show) {
                        output += '<strong>'+makeButton(condition.name, '!ct remove '+condition.name)+'</strong>:'+condition.duration+' Permanent (until removed)'
                    } else {
                        output += '<strong>'+condition.name+'</strong>: '+condition.duration+'Permanent (until removed)';
                    } 
                }

                output += '</div>'
            }    
        })

      return output;
  },

    handleLongString = (str, max=8) => {
        str = str.split(' ')[0];
        return (str.length > max) ? str.slice(0, max) + '...' : str;
    },

    delayTurn = () => {
        let turnorder, currentTurn, nextTurn, dummy
        //get turnorder and remove top two turns
        turnorder   = getTurnorder(),
        currentTurn = turnorder.shift();
        nextTurn    = turnorder.shift();
        if (debug) {
            log('Delay Turn')
            log('Current:' + currentTurn)
            log('Next:'+nextTurn)
        }
        turnorder.unshift(currentTurn)
        turnorder.unshift(nextTurn)

//        turnorder.unshift(nextTurn)
        //set the turnorder and move the marker
        setTurnorder(turnorder);
        doTurnorderChange(false,true);
    },
    
    NextTurn = () => {
        if (debug) {
            log('Next Turn')
        }
        let turnorder, currentTurn
        //get turnorder and remove top turn
        turnorder = getTurnorder(),
        currentTurn = turnorder.shift();
        //add current turn to bottom
        turnorder.push(currentTurn);
        //set the turnorder and move the marker
        setTurnorder(turnorder);
        doTurnorderChange();
    },

    PrevTurn = () => {
        let turnorder = getTurnorder(),
            last_turn = turnorder.pop();        
        turnorder.unshift(last_turn);

        setTurnorder(turnorder);
        doTurnorderChange(true);
    },

    NextRound = () => {
        let marker = getOrCreateMarker();
        round++;
        marker.set({ name: 'Round ' + round});

        if(state[combatState].config.announcements.announce_round){
            let text = '<span style="font-size: 12pt; font-weight: bold;">'+marker.get('name')+'</span>';
            makeAndSendMenu(text, ' ');
        }

        if(state[combatState].config.turnorder.reroll_ini_round){
            let turnorder = getTurnorder();
            clearTurnorder();
            rollInitiative(turnorder.map(t => { return (t.id !== -1 && t.id !== marker.get('id')) ? { _type: 'graphic', _id: t.id } : false }), state[combatState].config.turnorder.auto_sort);
            sortTurnorder();
        }else{
            NextTurn();
            sortTurnorder();
        }
    },

    PrevRound = () => {
        let marker = getOrCreateMarker();
        round--;
        marker.set({ name: 'Round ' + round});

        if(state[combatState].config.announcements.announce_round){
            let text = '<span style="font-size: 16pt; font-weight: bold;">'+marker.get('name')+'</span>';
            makeAndSendMenu(text);
        }

        PrevTurn();
    },

    changeMarker = (token, next=false) => {
        let marker = getOrCreateMarker(next);

        // if (debug) {
        //     log('Change Marker')
        //     log('Marker:' + marker)
        // }
        if(!token){
            resetMarker(next);
            return;
        }

        let position = {
            top: token.get('top'),
            left: token.get('left'),
            width: token.get('width')+(token.get('width')*0.35),
            height: token.get('height')+(token.get('height')*0.35),
        };

        if(token.get('layer') !== marker.get('layer')){
            if(marker.get('layer') === 'gmlayer'){ // Go from gmlayer to tokenlayer
                marker.set(position);

                setTimeout(() => {
                    marker.set({ layer: 'objects' });
                }, 500);
            }else{ // Go from tokenlayer to gmlayer
                marker.set({ layer: 'gmlayer' });

                setTimeout(() => {
                    marker.set(position);
                }, 500);
            }
        }else{
            marker.set(position);
        }

        toBack(marker);
    },

    stopRotate = () => {
        clearInterval(rotationInterval);
    },

    checkMarkerturn = (marker) => {
        let turnorder = getTurnorder(),
            hasTurn = false;
        
        // if (debug) {
        //     log ('Check Marker Turn')
        // }    
        
        turnorder.forEach(turn => {
            if(turn.id === marker.get('id')) hasTurn = true;
        });

        if(!hasTurn){
            turnorder.push({ id: marker.get('id'), pr: -1, custom: '', pageid: marker.get('pageid') });
            Campaign().set('turnorder', JSON.stringify(turnorder));
        }
    },

    sortTurnorder = (order='DESC') => {
        let turnorder = getTurnorder();

        turnorder.sort((a,b) => { 
            return (order === 'ASC') ? a.pr - b.pr : b.pr - a.pr;
        });

        setTurnorder(turnorder);
 //       doTurnorderChange();
    },

    getTurnorder = () => {
        return (Campaign().get('turnorder') === '') ? [] : Array.from(JSON.parse(Campaign().get('turnorder')));
    },

    getCurrentTurn = () => {
        return getTurnorder().shift();
    },

    getNextTurn = () => {
        let returnturn;
        getTurnorder().every((turn, i) => {
            if(i > 0 && turn.id !== '-1' && turn.id !== getOrCreateMarker().get('id')){
                returnturn = turn;
                return false;
            }else return true
        });
        return returnturn;
    },

    addToTurnorder = (turn) => {
        let turnorder = getTurnorder(),
            justDoIt = true;

        if (debug) {
            log('Add to Turnorder')
        }
        
        // turnorder.forEach(t => {
        //     if (debug){
        //         log('Turn:' + t)
        //     }            
        //     if(t.id === turn.id) justDoIt = false;
        // });

        // if(justDoIt){
            turnorder.push(turn);
            setTurnorder(turnorder);
        // }
    },

    setTurnorder = (turnorder) => {
        Campaign().set('turnorder', JSON.stringify(turnorder));
    },

    randomBetween = (min, max) => {
        return Math.floor(Math.random()*(max-min+1)+min);
    },
	
	editCombatState = (args) => {
		if(args[1]){
			let setting = args[1].split('|');
			let key = setting.shift();
			let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];		
			
			if(args[0] === 'combat'){
				state[combatState].config[key] = value;
			}
			
			if(args[0] === 'timer'){
				state[combatState].config.timer[key] = value;
			}
			
			if (args[0] === 'turnorder'){
				if(key === 'ini_die') {
					value = parseInt(value);
				}
				state[combatState].config.turnorder[key] = value;
			}	
			
			if (args[0] === 'announcements'){
				state[combatState].config.announcements[key] = value;
			}
			
			if (args[0] === 'macro'){
				state[combatState].config.macro[key] = value;
			}
		}	

		if(args[0] === 'combat'){
			sendCombatMenu();
		} else if(args[0] === 'timer'){
			sendTimerMenu();
		} else if (args[0] === 'turnorder'){
			sendTurnorderMenu();
		} else if (args[0] === 'announcements'){
			sendAnnounceMenu();
		} else if (args[0] === 'macro'){
			sendMacroMenu();
		} else {
			sendConfigMenu();
		}		
	},

	editFavoriteState = (value) => {
		state[statusState].config.showConditions = value;
	},
	
	editFavoriteConditon = (args) => {
	    
        let condition = args.shift(),
            setting = args.shift().split('|'),
            key = setting.shift(),
            value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];                    
 
        if (debug) {
            log ('Edit Favorite Condition')
            log('Key:'+key)
            log('Value:'+value)
        }
        
        state[statusState].conditions[condition][key] = value;
        
        sendTrackerMenu()    
	},
	
	editStatusState = (args) => {
        let setting = args.shift().split('|'),
            key = setting.shift(),
            value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

        if (debug) {
            log ('Edit Status State')
            log('Key:'+key)
            log('Value:'+value)
        }

        state[statusState].config[key] = value;

        whisper = (state[statusState].config.sendOnlyToGM) ? '/w gm ' : '';
        
        sendStatusMenu();	    
	},
	
	createCondition = (condition) => {
		let name = condition.shift();

		if(!name){
			sendConditionsMenu('You didn\'t give a condition name, eg. <i>!'+state[statusState].config.command+' config-conditions add Prone</i>.');
		} else if (state[statusState].conditions[name.toLowerCase()]) {
			sendConditionsMenu('The condition `'+name+'` already exists.');
		} else {
			state[statusState].conditions[name.toLowerCase()] = {
				name: name,
				icon: 'red',
				description: '',
				duration: 1,
				direction: 0
			}	
			sendConditionMenu(condition.toLowerCase());		
		}		
	},
	
	deleteCondition = (condition) => {			
		let name = condition.shift(),
            confirm = args.shift();
			
		if (confirm === 'yes') {
			if(!name){
				sendConditionsMenu('You didn\'t give a condition name, eg. <i>!condition config-conditions remove Prone</i>.');
			} else if( !state[statusState].conditions[name.toLowerCase()]){
				sendConditionsMenu('The condition `'+name+'` does\'t exist.');
			} else {
				delete state[statusState].conditions[name.toLowerCase()];
				sendConditionsMenu('The condition `'+name+'` is removed.');
			}
		}	
	},
	
	editCondition = (args, conditionKey) => {
	    if (debug) {
            log('Edit Condition')
	    }
	    
        if (args.length > 0) {
    		let setting = args.shift().split('|'),
    		    key     = setting.shift(),
    		    value   = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];
		
			if (debug) {
			    log('Settings:' + setting)
			    log('Key:' + key)
			    log('Value:' + value)
			}
    
    		if(key === 'name' && value !== state[statusState].conditions[conditionKey].name){ 
   				state[statusState].conditions[value.toLowerCase()] = state[statusState].conditions[conditionKey];
   				delete state[statusState].conditions[conditionKey];
 				conditionKey = value.toLowerCase();
    	    }
    
            if (key === 'description') {
                value = value + ' ' + args.join(' ') 
            }
   			state[statusState].conditions[conditionKey][key] = value;
        }
		
		sendConditionMenu(conditionKey);	
	},
	
    getConditions = () => {
        return state[statusState].conditions;
    },
	
    sendConfigMenu = () => {

		let configCombatButton          = makeBigButton('Combat', '!ct config combat'),
	     	configTurnorderButton       = makeBigButton('Turnorder', '!ct config turnorder'),
			configTimerButton           = makeBigButton('Timer', '!ct config timer'),
			configAnnouncementsButton   = makeBigButton('Announcement', '!ct config announcements'),
			configMacroButton           = makeBigButton('Macro', '!ct config macro'),
			configStatusButton          = makeBigButton('Status', '!condition config'),
			configConditionButton       = makeBigButton('Conditions', '!condition config-conditions'),
			exportButton                = makeBigButton('Export', '!condition export'),
			importButton                = makeBigButton('Import', '!condition import ?{Config}'),	
			resetButton                 = makeBigButton('Reset', '!ct reset'),
			backToTrackerButton         = makeBigButton('Back To Tracker', '!ct'),
			titleText                   = 'CombatTracker Setup<span style="' + styles.version + '"> (' + version + ')</span>',
			combatHeaderText            = '<div style="'+styles.header+'">Combat Setup</div>',
			statusHeadersText           = '<div style="'+styles.header+'">Status Setup</div>',
			resetHeaderText             = '<div style="'+styles.header+'">Reset CombatTracker</div>',	
			backToTrackerText           = '<div style="'+styles.header+'">Return to Tracker</div>',	
			
		 	contents  = combatHeaderText
			contents += configCombatButton
			contents += configTurnorderButton			
			contents += configTimerButton
			contents += configAnnouncementsButton
			contents += configMacroButton	
			contents += statusHeadersText 
			contents += configStatusButton
			contents += configConditionButton
			contents += exportButton
			contents += importButton
			contents += resetHeaderText
			contents += resetButton;
			
			if (state[combatState].config.returnToTracker) {
			    contents += backToTrackerText
			    contents += backToTrackerButton
			}
			
        makeAndSendMenu(contents, titleText, 'gm');
    },

    sendCombatMenu = () => {
        let backButton = makeBigButton('Back', '!ct config'),			
			listItems = [
				makeTextButton('Initiative Attr', state[combatState].config.initiative_attribute_name, '!ct config combat initiative_attribute_name|?{Attribute|'+state[combatState].config.initiative_attribute_name+'}'),
				makeTextButton('Marker', '<img src="'+state[combatState].config.marker_img+'" width="15px" height="15px" />', '!ct config combat marker_img|?{Image Url}'),
				makeTextButton('Use Next Marker',state[combatState].config.next_marker, '!ct config combat next_marker|'+!state[combatState].config.next_marker),
				makeTextButton('Next Marker', '<img src="'+state[combatState].config.next_marker_img+'" width="15px" height="15px" />', '!ct config combat next_marker_img|?{Image Url}'),
				makeTextButton('Stop on Close', state[combatState].config.close_stop, '!ct config combat close_stop|'+!state[combatState].config.close_stop),
				makeTextButton('Auto Pull Map', state[combatState].config.pull, '!ct config combat pull|'+!state[combatState].config.pull),
				makeTextButton('Display Duration', state[combatState].config.duration, '!ct config combat duration|'+!state[combatState].config.duration),      
			],		
			contents = makeList(listItems, backButton);	
			
        makeAndSendMenu(contents, 'Combat Setup', 'gm');
    },

	sendTurnorderMenu = () => {
        let backButton = makeBigButton('Back', '!ct config'),
			listItems = [
				makeTextButton('Auto Roll Initiative', state[combatState].config.turnorder.throw_initiative, '!ct config turnorder throw_initiative|'+!state[combatState].config.turnorder.throw_initiative),
				makeTextButton('Initiative Die', 'd' + state[combatState].config.turnorder.ini_die, '!ct config turnorder ini_die|?{Die (without the d)|'+state[combatState].config.turnorder.ini_die+'}'),
				makeTextButton('Roll Ini Each Round', state[combatState].config.turnorder.reroll_ini_round, '!ct config turnorder reroll_ini_round|'+!state[combatState].config.turnorder.reroll_ini_round),
				makeTextButton('Show Initiative', state[combatState].config.turnorder.show_initiative_roll, '!ct config turnorder show_initiative_roll|'+!state[combatState].config.turnorder.show_initiative_roll),
				makeTextButton('Auto Sort Turnorder', state[combatState].config.turnorder.auto_sort, '!ct config turnorder auto_sort|'+!state[combatState].config.turnorder.auto_sort),
				makeTextButton('Skip Custom Item', state[combatState].config.turnorder.skip_custom, '!ct config turnorder skip_custom|'+!state[combatState].config.turnorder.skip_custom),
			],
			contents = makeList(listItems, backButton);	
			
        makeAndSendMenu(contents, 'Turnorder Setup', 'gm');
    },
	
    sendTimerMenu = () => {
        let backButton = makeBigButton('Back', '!ct config'),
            listItems = [
                 makeTextButton('Turn Timer', state[combatState].config.timer.use_timer, '!ct config timer use_timer|'+!state[combatState].config.timer.use_timer),
                 makeTextButton('Time', state[combatState].config.timer.time, '!ct config timer time|?{Time|'+state[combatState].config.timer.time+'}'),
                 makeTextButton('Auto Skip', state[combatState].config.timer.auto_skip, '!ct config timer auto_skip|'+!state[combatState].config.timer.auto_skip),
                 makeTextButton('Chat Timer', state[combatState].config.timer.chat_timer, '!ct config timer chat_timer|'+!state[combatState].config.timer.chat_timer),
                 makeTextButton('Show on Token', state[combatState].config.timer.token_timer, '!ct config timer token_timer|'+!state[combatState].config.timer.token_timer),
                 makeTextButton('Token Font', state[combatState].config.timer.token_font, '!ct config timer token_font|?{Font|Arial|Patrick Hand|Contrail|Light|Candal}'),
                 makeTextButton('Token Font Size',state[combatState].config.timer.token_font_size, '!ct config timer token_font_size|?{Font Size|'+state[combatState].config.timer.token_font_size+'}'),
            ],
            contents = makeList(listItems, backButton);	
        
		makeAndSendMenu(contents, 'Timer Setup', 'gm');
    },	
	
    sendAnnounceMenu = () =>{
        let backButton = makeBigButton('Back', '!ct config'),
			listItems = [
				makeTextButton('Announce Rounds', state[combatState].config.announcements.announce_round, '!ct config announcements announce_round|'+!state[combatState].config.announcements.announce_round),
				makeTextButton('Announce Turns', state[combatState].config.announcements.announce_turn, '!ct config announcements announce_turn|'+!state[combatState].config.announcements.announce_turn),
				makeTextButton('Whisper GM Only', state[combatState].config.announcements.whisper_turn_gm, '!ct config announcements whisper_turn_gm|'+!state[combatState].config.announcements.whisper_turn_gm),
				makeTextButton('Shorten Long Names', state[combatState].config.announcements.handleLongName, '!ct config announcements handleLongName|'+!state[combatState].config.announcements.handleLongName),
				makeTextButton('Use FX', state[combatState].config.announcements.use_fx, '!ct config announcements use_fx|'+!state[combatState].config.announcements.use_fx),
				makeTextButton('FX Type', state[combatState].config.announcements.fx_type, '!ct config announcements fx_type|?{Type|'+state[combatState].config.announcements.fx_type+'}'),
			],
			contents = makeList(listItems, backButton);	
			
        makeAndSendMenu(contents, 'Announcements Setup', 'gm');
    },

    sendMacroMenu = () => {
        let backButton = makeBigButton('Back', '!ct config'),
			listItems = [
				makeTextButton('Run Macro', state[combatState].config.macro.run_macro, '!ct config macro run_macro|'+!state[combatState].config.macro.run_macro),
				makeTextButton('Macro Name', state[combatState].config.macro.macro_name, '!ct config macro macro_name|?{Macro Name|'+state[combatState].config.macro.macro_name+'}'),
			],
            contents = makeList(listItems, backButton) + '<p>A macro with the right name should be in the characters ability list.</p>';	
			
        makeAndSendMenu(contents, 'Macro Setup', 'gm');
    },
	
	//Start Status Menus
	sendStatusMenu = (first) => {
        let backButton = makeBigButton('Back', '!ct config'),
            listItems = [
				makeTextButton('Only to GM', state[statusState].config.sendOnlyToGM, '!condition config sendOnlyToGM|'+!state[statusState].config.sendOnlyToGM),
				makeTextButton('Player Show', state[statusState].config.userAllowed, '!condition config userAllowed|'+!state[statusState].config.userAllowed),
				makeTextButton('Player Toggle', state[statusState].config.userToggle, '!condition config userToggle|'+!state[statusState].config.userToggle),
				makeTextButton('Show Status Change', state[statusState].config.showDescOnStatusChange, '!condition config showDescOnStatusChange|'+!state[statusState].config.showDescOnStatusChange),
				makeTextButton('Display Icon in Chat', state[statusState].config.showIconInDescription, '!condition config showIconInDescription|'+!state[statusState].config.showIconInDescription),
				makeTextButton('Show Conditions', state[statusState].config.showConditions, '!condition config showConditions|?{Show|All|Favorites}'),	
			],			
			contents = makeList(listItems, backButton);	

        makeAndSendMenu(contents, 'Status Setup', 'gm')		
	},
	
    sendConditionsMenu = (message) => {
        let key, duration, direction, override,	condition, conditionButton, favorite, icon,	output,
            backButton = makeBigButton('Back', '!ct' + ' config'),
			addButton = makeBigButton('Add Condition', '!condition config-conditions add ?{Name}'),
			listItems = [],
            icons = [],
            check = true,
			contents = '<div>Icon Name <span style="float:right">(Dir,Dur,Ovr,Fav)</span></div>'
			
        for (key in state[statusState].conditions) {
            condition       = state[statusState].conditions[key]
            conditionButton = makeButton(state[statusState].conditions[key].name, '!condition config-conditions ' + key)
			icon            = getIcon(state[statusState].conditions[key].icon,'display:inline-block;',24,24)
			
			if (!condition.duration) {
				duration = 'N'
			} else {
				duration = condition.duration
			}	
			if (!condition.direction) {
				direction = 'N'
			} else {
				direction = condition.direction
			}	
			if (!condition.override) {
				override = 'N'
			} else {
				override = 'Y'
			}		
			if (condition.favorite) {
			    favorite = 'Y'
			} else {
			    favorite = 'N'
			}

            listItems.push(icon+'<span>'+conditionButton+'</span><span style="float:right">('+duration+','+direction+','+override+','+favorite+')</span>');

            if(check && icons.includes(state[statusState].conditions[key].icon)){
                message = message || '' + '<br>Multiple conditions use the same icon';
                check = false;
            }
        }

        message = (message) ? '<p style="color: red">'+message+'</p>' : '';
        contents += message + makeList(listItems, backButton, addButton);
        makeAndSendMenu(contents, 'Conditions');
    },

    sendConditionMenu = (key, message) => {
        let condition           = state[statusState].conditions[key],
			removeButton        = makeBigButton('Delete Condition', '!condition config-conditions remove '+key+' ?{Are you sure?|Yes,yes|No,no}'),
			descriptionButton   = makeBigButton('Edit Description', '!condition config-conditions '+key+' description|?{Description|'+condition.description+'}'),
			backButton
	    
	    if (state[combatState].config.returnToTracker) {
	        backButton          = makeBigButton('Back', '!ct', buttonStyle + ' width: 100%')
	    } else {
	        backButton          = makeBigButton('Back', '!condition config-conditions', buttonStyle + ' width: 100%')
	    }
	    
		let	markerDropdown = '?{Marker';		
        markers.forEach((marker) => {
            markerDropdown += '|'+ucFirst(marker).replace(/-/g, ' ')+','+marker
        })
        markerDropdown += '}';

		let	listItems = [
				makeTextButton('Name', condition.name, '!condition config-conditions '+key+' name|?{Name}'),
				makeTextButton('Marker', getIcon(condition.icon) || condition.icon, '!condition config-conditions '+key+' icon|'+markerDropdown),				
				makeTextButton('Duration', condition.duration, '!condition config-conditions '+key+' duration|?{Duration|1}'),
				makeTextButton('Direction', condition.direction, '!condition config-conditions '+key+' direction|?{Direction|0}'),
				makeTextButton('Override', condition.override, '!condition config-conditions '+key+' override|'+!condition.override),
				makeTextButton('Favorites', condition.favorite, '!condition config-conditions '+key+' favorite|'+!condition.favorite)
			];

        message = (message) ? '<p style="color: red">'+message+'</p>' : '';
		let contents = message+makeList(listItems)+'<hr>'+descriptionButton+'<b>Description:</b>'+condition.description+removeButton+'<hr>'+backButton 	
        makeAndSendMenu(contents, 'Condition Setup');
    },

    sendTrackerMenu = () => {
        let nextButton          = makeImageButton('!ct next b',nextImage,'Next Turn','transparent',18),
            prevButton          = makeImageButton('!ct prev b',prevImage,'Previous Turn','transparent',18),
            stopButton          = makeImageButton('!ct stop b',stopImage,'Stop Combat','transparent',18),
            startButton         = makeImageButton('!ct start b',startImage,'Start Combat','transparent',18),
            pauseTimerButton    = makeImageButton('!ct pt b',pauseImage,'Pause Timer','transparent',18),
            stopTimerButton     = makeImageButton('!ct st b',timerImage,'Stop Timer','transparent',18),
            allConditionsButton = makeImageButton('!ct all b',allConditionsImage,'Show All Conditions','transparent',18),
            favoritesButton     = makeImageButton('!ct fav b',favoriteImage,'Show Favorites','transparent',18),
            configButton        = makeImageButton('!ct tracker b',backImage,'Show Setup','transparent',18),
            listItems           = [],
            titleText           = 'CombatTracker Menu<span style="' + styles.version + '"> (' + version + ')</span>',
            contents, key, condition, conditionButton, addButton, removeButton,favoriteButton,listContents;

        state[combatState].config.returnToTracker = true
        
        if (inFight() ) {
            contents = '<div style="background-color:green;width:100%;padding:2px;vertical-align:middle">'+stopButton + prevButton + nextButton + pauseTimerButton + stopTimerButton 
            if (state[statusState].config.showConditions == 'Favorites'){
                contents += allConditionsButton
            } else {
                contents += favoritesButton
            } 
        } else {
            contents = '<div style="background-color:red">'+startButton 
        }     

        contents += configButton
        contents += '</div>'
        
        for(key in state[statusState].conditions){
            condition       = state[statusState].conditions[key]
            conditionButton = makeImageButton('!condition config-conditions '  + key,backImage,'Edit Condition','transparent',12)
            removeButton    = makeImageButton('!ct remove '  + key,deleteImage,'Remove Condition','transparent',12)
            
            if (condition.override) {
                addButton = makeImageButton('!ct add '+key +' ?{Duration|'+condition.duration+'} ?{Direction|'+condition.direction + '}' ,addImage,'Add Condition','transparent',12)
            } else {
                addButton = makeImageButton('!ct add '+key+' '+condition.duration+' '+condition.direction,addImage,'Add Condition','transparent',12)
            }
            
            if (condition.favorite) {
                favoriteButton = makeImageButton('!condition favorite '+key+' favorite|'+!condition.favorite,favoriteImage,'Remove from Favorites','transparent',12)
            } else {
                favoriteButton = makeImageButton('!condition favorite '+key+' favorite|'+!condition.favorite,allConditionsImage,'Add to Favorites','transparent',12)
            }

            listContents = '<div>'
            listContents += getIcon(state[statusState].conditions[key].icon,'display:inline-block;margin-right:3px')
            listContents += '<span style="vertical-align:middle">'+condition.name+'</span>'
            listContents += '<span style="float:right;vertical-align:middle">'+addButton+removeButton+favoriteButton+conditionButton+'</span>'
            listContents += '</div>'
            
            if (state[statusState].config.showConditions == 'Favorites') {
                if (state[statusState].conditions[key].favorite) {
                    listItems.push(listContents);
                }    
            } else {
                listItems.push(listContents);
            }
        }
        makeAndSendMenu(contents+makeList(listItems),titleText,'gm');
    },
    
    showConditions = (tokens, toPlayers) => {
        let tokenObj
        
        tokens.forEach(token => {
            if (token._type == 'graphic') {
                tokenObj = getObj('graphic', token._id);
                announcePlayer(tokenObj, 'gm', false, false, true);
            }
        })    
    },
    
    makeAndSendMenu = (contents, title, whisper) => {
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
		title = makeTitle(title)
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>', null, {noarchive:true});
    },

	makeTitle = (title) => {
		return '<div style="'+styles.title+'">'+title+'</div>'+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;style="float:left;"></div>'
	},
	
    makeBigButton = (title, href) => {
        return '<div style="width:100%"><a style="'+styles.button+'" href="'+href+'">'+title+'</a></div>';
    },

	makeButton = (title, href, style) => {
        return '<a style="'+styles.linkButton+'" href="'+href+'">'+title+'</a>';
    },

	makeTextButton = (label, value, href) => {
        return '<span style="'+styles.textLabel+'">'+label+'</span><a style="'+styles.textButton+'" href="'+href+'">'+value+'</a>';
    },

    makeImageButton = function(command, image, toolTip, backgroundColor,size){
        return '<div style="display:inline-block;margin-top:5px;margin-bottom:5px;margin-right:3px;padding:1px;vertical-align:middle;"><a href="'+command+'" title= "'+toolTip+'" style="margin:0px;padding:0px;border:0px solid;background-color:'+backgroundColor+'"><span style="color:black;padding:0px;font-size:'+size+'px;font-family: \'Pictos\'">'+image+'</span></a></div>'
    },
	
    makeList = (items, backButton, extraButton) => {
        let list;
        
        list  = '<ul style="'+styles.reset + styles.list + styles.overflow+'">'
		items.forEach((item) => {
            list += '<li style="'+styles.overflow+'">'+item+'</li>';
        });
		list += '</ul>'
		
		if (extraButton) {
			list += extraButton
		}
		if(backButton) {
			list += '<hr>'+backButton;
		}
        return list;
    },

    sendConditionToChat = (condition) => {
        let icon = (state[statusState].config.showIconInDescription) ? getIcon(condition.icon, 'margin-right: 5px; margin-top: 5px; display: inline-block;') || '' : '';

        if (debug) {
            log('Send Condition To Chat')
        }
        makeAndSendMenu(condition.description, icon+condition.name,(state[statusState].config.sendOnlyToGM) ? 'gm' : '');
    },
    
    getCombatConditionByName = (tokenID, name) => {
        state[combatState].conditions[tokenID].forEach((condition) => {
            if (condition.name == name) {
                return true
            }
        })
        return false;
    },

    getConditionByMarker = (marker) => {
        return getObjects(state[statusState].conditions, 'icon', marker).shift() || false;
    },

    getConditionByKey = (key) => {
        return state[statusState].conditions[key];
    },

    getIcon = (icon, style='', height, width) => {
        let X = '';
        let iconStyle = ''
        let iconSize = ''

        if(typeof icon_image_positions[icon] === 'undefined') return false;

        if (width) {
            iconStyle += 'width: '+width+'px;height: '+height+'px;';
        } else {
            iconStyle += 'width: 24px; height: 24px;';
        }      
        
        if(Number.isInteger(icon_image_positions[icon])){
            iconStyle += 'background-image: url(https://roll20.net/images/statussheet.png);'
            iconStyle += 'background-repeat: no-repeat;'
            iconStyle += 'background-position: -'+icon_image_positions[icon]+'px 0;'
        }else if(icon_image_positions[icon] === 'X'){
            iconStyle += 'color: red; margin-right: 0px;';
            X = 'X';
        }else{
            iconStyle += 'background-color: ' + icon_image_positions[icon] + ';';
            iconStyle += 'border: 1px solid white; border-radius: 50%;'
        }

        iconStyle += style;

        return '<div style="vertical-align:middle;'+iconStyle+'">'+X+'</div>';
    },
    
    checkInstall = () => {
        if(!_.has(state, combatState)){
            state[combatState] = state[combatState] || {};
            state[statusState] = state[statusState] || {};
        }
        setDefaults();
        log(script_name + ' Ready! Command: !'+state[combatState].config.command);
    },

    handeIniativePageChange = (obj,prev) => {
        if(state[combatState].config.close_stop && (obj.get('initiativepage') !== prev.initiativepage && !obj.get('initiativepage'))){
            stopCombat();
        }
    },

    observeTokenChange = function(handler){
        if(handler && _.isFunction(handler)){
            observers.tokenChange.push(handler);
        }
    },

    notifyObservers = function(event,obj,prev){
        _.each(observers[event],function(handler){
            handler(obj,prev);
        });
    },
    
    handleTurnorderChange = (obj, prev) => {
        if (debug) {
            log("Handle Turnorder Change")
        }
        
        if(obj.get('turnorder') === prev.turnorder) return;

        let turnorder = (obj.get('turnorder') === "") ? [] : JSON.parse(obj.get('turnorder'));
        let prevTurnorder = (prev.turnorder === "") ? [] : JSON.parse(prev.turnorder);

        if(obj.get('turnorder') === "[]"){
            resetMarker();
            stopTimer();
            return;
        }

        if(turnorder.length && prevTurnorder.length && turnorder[0].id !== prevTurnorder[0].id){
            doTurnorderChange();
        }
    },

    handleGraphicMovement = (obj /*, prev */) => {
         if (debug) {
            log ('Handle Graphic Movement')
        } 
 
        if(!inFight()) return;

        if(getCurrentTurn().id === obj.get('id')){
            changeMarker(obj);
        }

        // if (state[combatState].config.next_marker) {
        //     if (getNextTurn()) {
        //         if (getNextTurn().id === obj.get('id') {
        //             changeMarker(obj, true);
        //         }    
        //     }
        // }
        // if(getNextTurn().id === obj.get('id')){
        //     changeMarker(obj, true);
        // }
    },

    handleShapedSheet = (characterid, condition, add) => {
        if (debug) {
            log ('Handle Shaped Sheet Change')
        } 
        let character = getObj('character', characterid);
        if(character){
            let sheet = getAttrByName(character.get('id'), 'character_sheet', 'current');
            if(!sheet || !sheet.toLowerCase().includes('shaped')) return;
            if(!shaped_conditions.includes(condition)) return;

            let attributes = {};
            attributes[condition] = (add) ? '1': '0';
            setAttrs(character.get('id'), attributes);
        }
    },
    
    handleStatusMarkerChange = (obj, prev) => {
        if (debug) {
            log ('Handle Status Marker Change')
        } 

        prev.statusmarkers = (typeof prev.get === 'function') ? prev.get('statusmarkers') : prev.statusmarkers;

        if(state[statusState].config.showDescOnStatusChange && typeof prev.statusmarkers === 'string'){
            // Check if the statusmarkers string is different from the previous statusmarkers string.
            if(obj.get('statusmarkers') !== prev.statusmarkers){
                // Create arrays from the statusmarkers strings.
                var prevstatusmarkers = prev.statusmarkers.split(",");
                var statusmarkers = obj.get('statusmarkers').split(",");
                if (debug) {
                    log('New Statuses:'+statusmarkers)
                    log('Old Statuses:'+prevstatusmarkers)
                }
                // Loop through the statusmarkers array.
                statusmarkers.forEach(function(marker){
                    let condition = getConditionByMarker(marker);
                    if(!condition) return;
                    // If it is a new statusmarkers, add condition to combat state 
                    if(marker !== "" && !prevstatusmarkers.includes(marker)){
                        addCondition(obj, condition.name.toLowerCase());
                    }
                });
                //loop through previous statusmarkers array
                prevstatusmarkers.forEach((marker) => {
                    let condition = getConditionByMarker(marker);
                    if(!condition) return;
                    
                    // if it is a remove statusmarker, remove it from combat state
                    if(marker !== '' && !statusmarkers.includes(marker)){
                        removeCondition(obj, condition.name.toLowerCase());
                    }
                })
            }
        }
    },

    // handleAttributeChange = (obj, prev) => {
    //     if(!shaped_conditions.includes(obj.get('name'))) return;

    //     let tokens = findObjs({ represents: obj.get('characterid') });

    //     handleConditions([obj.get('name')], tokens, (obj.get('current') === '1') ? 'add' : 'remove')
    // },

    //return an array of objects according to key, value, or key and value matching
    getObjects = (obj, key, val) => {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));    
            } else 
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
        return objects;
    },

    
    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
                //' ' : '&'+'nbsp'+';',
                '<' : '&'+'lt'+';',
                '>' : '&'+'gt'+';',
                "'" : '&'+'#39'+';',
                '@' : '&'+'#64'+';',
                '{' : '&'+'#123'+';',
                '|' : '&'+'#124'+';',
                '}' : '&'+'#125'+';',
                '[' : '&'+'#91'+';',
                ']' : '&'+'#93'+';',
                '"' : '&'+'quot'+';'
            },
            re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),


    ucFirst = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    
    registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:campaign:turnorder', handleTurnorderChange);
        on('change:graphic:statusmarkers', handleStatusMarkerChange);
//        on('change:attribute', handleAttributeChange);		
        on('change:campaign:initiativepage', handeIniativePageChange);
        on('change:graphic:top', handleGraphicMovement);
        on('change:graphic:left', handleGraphicMovement);
        on('change:graphic:layer', handleGraphicMovement);

        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(function(obj,prev){
                handleStatusMarkerChange(obj,prev);
            });
        }

        if('undefined' !== typeof DeathTracker && DeathTracker.ObserveTokenChange){
            DeathTracker.ObserveTokenChange((obj,prev) => {
                handleStatusMarkerChange(obj,prev);
            });
        }

        if('undefined' !== typeof InspirationTracker && InspirationTracker.ObserveTokenChange){
            InspirationTracker.ObserveTokenChange((obj,prev) => {
                handleStatusMarkerChange(obj,prev);
            });
        }

        // if('undefined' !== typeof CombatTracker && CombatTracker.ObserveTokenChange){
        //     CombatTracker.ObserveTokenChange((obj,prev) => {
        //         handleStatusMarkerChange(obj,prev);
        //     });
        // }		
    },
	
    setDefaults = (reset) => {
	
		log('Defaults')
		
        const combatDefaults = {
            config: {
                command: 'ct',
			    marker_img: 'https://s3.amazonaws.com/files.d20.io/images/52550079/U-3U950B3wk_KRtspSPyuw/thumb.png?1524507826',
				next_marker: false,
				next_marker_img: 'https://s3.amazonaws.com/files.d20.io/images/66352183/90UOrT-_Odg2WvvLbKOthw/thumb.png?1541422636',
				initiative_attribute_name: 'initiative_bonus',
				close_stop: true,
				pull: true,			
				duration: false,
				favorite: false,
				returnToTracker: false,
                turnorder: {
                    throw_initiative: true,
                    ini_die: 20,
                    show_initiative_roll: false,
                    auto_sort: true,
                    reroll_ini_round: false,
                    skip_custom: true,
                },
                timer: {
                    use_timer: true,
                    time: 120,
                    auto_skip: true,
                    chat_timer: true,
                    token_timer: true,
                    token_font: 'Candal',
                    token_font_size: 16,
                    token_font_color: 'rgb(255, 0, 0)'
                },
                announcements: {
                    announce_conditions: false,
                    announce_turn: true,
                    whisper_turn_gm: false,
                    announce_round: true,
                    handleLongName: true,
                    use_fx: false,
                    fx_type: 'nova-holy'
                },
                macro: {
                    run_macro: true,
                    macro_name: 'CT_TURN'
                }
            },
            conditions: []
        };

        if(!state[combatState].config || typeof state[combatState].config == 'undefined') {
            state[combatState].config = combatDefaults.config;
        }else{
            if(!state[combatState].config.hasOwnProperty('command')){
                state[combatState].config.command = combatDefaults.config.command;
            }		
			if(!state[combatState].config.hasOwnProperty('marker_img')){
				state[combatState].config.marker_img = combatDefaults.config.marker_img;
			}
			if(!state[combatState].config.hasOwnProperty('next_marker')){
				state[combatState].config.next_marker = combatDefaults.config.next_marker;
			}
			if(!state[combatState].config.hasOwnProperty('next_marker_img')){
				state[combatState].config.next_marker_img = combatDefaults.config.next_marker_img;
			}
			if(!state[combatState].config.hasOwnProperty('initiative_attribute_name')){
				state[combatState].config.initiative_attribute_name = combatDefaults.config.initiative_attribute_name;
			}
			if(!state[combatState].config.hasOwnProperty('close_stop')){
				state[combatState].config.close_stop = combatDefaults.config.close_stop;
			}
			if(!state[combatState].config.hasOwnProperty('pull')){
				state[combatState].config.pull = combatDefaults.config.pull;
			}
			if(!state[combatState].config.hasOwnProperty('favorite')){
				state[combatState].config.favorite = combatDefaults.config.favorite;
			}  		
			if(!state[combatState].config.hasOwnProperty('returnToTracker')){
				state[combatState].config.returnToTracker = combatDefaults.config.returnToTracker;
			}  		
			
						
            if(!state[combatState].config.hasOwnProperty('turnorder')){
                state[combatState].config.turnorder = combatDefaults.config.turnorder;
            }else{
                if(!state[combatState].config.turnorder.hasOwnProperty('skip_custom')){
                    state[combatState].config.turnorder.skip_custom = combatDefaults.config.turnorder.skip_custom;
                }
                if(!state[combatState].config.turnorder.hasOwnProperty('throw_initiative')){
                    state[combatState].config.turnorder.throw_initiative = combatDefaults.config.turnorder.throw_initiative;
                }
                if(!state[combatState].config.turnorder.hasOwnProperty('ini_die')){
                    state[combatState].config.turnorder.ini_die = combatDefaults.config.turnorder.ini_die;
                }
                if(!state[combatState].config.turnorder.hasOwnProperty('auto_sort')){
                    state[combatState].config.turnorder.auto_sort = combatDefaults.config.turnorder.auto_sort;
                }
                if(!state[combatState].config.hasOwnProperty('reroll_ini_round')){
                    state[combatState].config.turnorder.reroll_ini_round = combatDefaults.config.turnorder.reroll_ini_round;
                }
            }
			
            if(!state[combatState].config.hasOwnProperty('timer')){
                state[combatState].config.timer = combatDefaults.config.timer;
            }else{
                if(!state[combatState].config.timer.hasOwnProperty('use_timer')){
                    state[combatState].config.timer.use_timer = combatDefaults.config.timer.use_timer;
                }
                if(!state[combatState].config.timer.hasOwnProperty('time')){
                    state[combatState].config.timer.time = combatDefaults.config.timer.time;
                }
                if(!state[combatState].config.timer.hasOwnProperty('auto_skip')){
                    state[combatState].config.timer.auto_skip = combatDefaults.config.timer.auto_skip;
                }
                if(!state[combatState].config.timer.hasOwnProperty('chat_timer')){
                    state[combatState].config.timer.chat_timer = combatDefaults.config.timer.chat_timer;
                }
                if(!state[combatState].config.timer.hasOwnProperty('token_timer')){
                    state[combatState].config.timer.token_timer = combatDefaults.config.timer.token_timer;
                }
                if(!state[combatState].config.timer.hasOwnProperty('token_font')){
                    state[combatState].config.timer.token_font = combatDefaults.config.timer.token_font;
                }
                if(!state[combatState].config.timer.hasOwnProperty('token_font_size')){
                    state[combatState].config.timer.token_font_size = combatDefaults.config.timer.token_font_size;
                }
                if(!state[combatState].config.timer.hasOwnProperty('token_font_color')){
                    state[combatState].config.timer.token_font_color = combatDefaults.config.timer.token_font_color;
                }
            }
			
            if(!state[combatState].config.hasOwnProperty('announcements')){
                state[combatState].config.announcements = combatDefaults.config.announcements;
            }else{
                if(!state[combatState].config.announcements.hasOwnProperty('announce_turn')){
                    state[combatState].config.announcements.announce_turn = combatDefaults.config.announcements.announce_turn;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('whisper_turn_gm')){
                    state[combatState].config.announcements.whisper_turn_gm = combatDefaults.config.announcements.whisper_turn_gm;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('announce_round')){
                    state[combatState].config.announcements.announce_round = combatDefaults.config.announcements.announce_round;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('announce_conditions')){
                    state[combatState].config.announcements.announce_conditions = combatDefaults.config.announcements.announce_conditions;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('handleLongName')){
                    state[combatState].config.announcements.handleLongName = combatDefaults.config.announcements.handleLongName;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('use_fx')){
                    state[combatState].config.announcements.use_fx = combatDefaults.config.announcements.use_fx;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('fx_type')){
                    state[combatState].config.announcements.fx_type = combatDefaults.config.announcements.fx_type;
                }
            }
			
            if(!state[combatState].config.hasOwnProperty('macro')){
                state[combatState].config.macro = combatDefaults.config.macro;
            }else{
                if(!state[combatState].config.macro.hasOwnProperty('run_macro')){
                    state[combatState].config.macro.run_macro = combatDefaults.config.macro.run_macro;
                }
                if(!state[combatState].config.macro.hasOwnProperty('macro_name')){
                    state[combatState].config.macro.macro_name = combatDefaults.config.macro.macro_name;
                }
            }
        }

        // if(!state[combatState].hasOwnProperty('conditions')){
        //     state[combatState].conditions = combatDefaults.conditions;
        // }

        const statusDefaults = {
            config: {
                command: 'condition',
                userAllowed: false,
                userToggle: false,
                sendOnlyToGM: false,
                showDescOnStatusChange: true,
                showIconInDescription: true,
                showConditions: 'All'
            },
            conditions: {
                blinded: {
                    name: 'Blinded',
                    description: '<p>A blinded creature can’t see and automatically fails any ability check that requires sight.</p> <p>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</p>',
                    icon: 'bleeding-eye',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                charmed: {
                    name: 'Charmed',
                    description: '<p>A charmed creature can’t Attack the charmer or target the charmer with harmful Abilities or magical effects.</p> <p>The charmer has advantage on any ability check to interact socially with the creature.</p>',
                    icon: 'broken-heart',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                deafened: {
                    name: 'Deafened',
                    description: '<p>A deafened creature can’t hear and automatically fails any ability check that requires hearing.</p>',
                    icon: 'edge-crack',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                frightened: {
                    name: 'Frightened',
                    description: '<p>A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.</p> <p>The creature can’t willingly move closer to the source of its fear.</p>',
                    icon: 'screaming',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                grappled: {
                    name: 'Grappled',
                    description: '<p>A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</p> <p>The condition ends if the Grappler is <i>incapacitated</i>.</p> <p>The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.</p>',
                    icon: 'grab',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                incapacitated: {
                    name: 'Incapacitated',
                    description: '<p>An incapacitated creature can’t take actions or reactions.</p>',
                    icon: 'interdiction',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                inspiration: {
                    name: 'Inspiration',
                    description: '<p>If you have inspiration, you can expend it when you make an Attack roll, saving throw, or ability check. Spending your inspiration gives you advantage on that roll.</p> <p>Additionally, if you have inspiration, you can reward another player for good roleplaying, clever thinking, or simply doing something exciting in the game. When another player character does something that really contributes to the story in a fun and interesting way, you can give up your inspiration to give that character inspiration.</p>',
                    icon: 'black-flag',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                invisibility: {
                    name: 'Invisibility',
                    description: '<p>An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.</p> <p>Attack rolls against the creature have disadvantage, and the creature’s Attack rolls have advantage.</p>',
                    icon: 'ninja-mask',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                paralyzed: {
                    name: 'Paralyzed',
                    description: '<p>A paralyzed creature is <i>incapacitated</i> and can’t move or speak.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>',
                    icon: 'pummeled',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                petrified: {
                    name: 'Petrified',
                    description: '<p>A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.</p> <p>The creature is <i>incapacitated</i>, can’t move or speak, and is unaware of its surroundings.</p> <p>Attack rolls against the creature have advantage.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>The creature has Resistance to all damage.</p> <p>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.</p>',
                    icon: 'frozen-orb',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                poisoned: {
                    name: 'Poisoned',
                    description: '<p>A poisoned creature has disadvantage on Attack rolls and Ability Checks.</p>',
                    icon: 'chemical-bolt',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                prone: {
                    name: 'Prone',
                    description: '<p>A prone creature’s only Movement option is to crawl, unless it stands up and thereby ends the condition.</p> <p>The creature has disadvantage on Attack rolls.</p> <p>An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.</p>',
                    icon: 'back-pain',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                restrained: {
                    name: 'Restrained',
                    description: '<p>A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</p> <p>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</p> <p>The creature has disadvantage on Dexterity saving throws.</p>',
                    icon: 'fishing-net',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                stunned: {
                    name: 'Stunned',
                    description: '<p>A stunned creature is <i>incapacitated</i>, can’t move, and can speak only falteringly.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p>',
                    icon: 'fist',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
                unconscious: {
                    name: 'Unconscious',
                    description: '<p>An unconscious creature is <i>incapacitated</i>, can’t move or speak, and is unaware of its surroundings.</p> <p>The creature drops whatever it’s holding and falls prone.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>',
                    icon: 'sleepy',
                    duration: 1,
					direction: -1,
					override: true,
					favorite: false
                },
            },
        };

        if(!state[statusState].config || typeof state[statusState].config == 'undefined'){
            state[statusState].config = statusDefaults.config;
        }else{
            if(!state[statusState].config.hasOwnProperty('command')){
                state[statusState].config.command = statusDefaults.config.command;
            }
            if(!state[statusState].config.hasOwnProperty('userAllowed')){
                state[statusState].config.userAllowed = statusDefaults.config.userAllowed;
            }
            if(!state[statusState].config.hasOwnProperty('userToggle')){
                state[statusState].config.userToggle = statusDefaults.config.userToggle;
            }
            if(!state[statusState].config.hasOwnProperty('sendOnlyToGM')){
                state[statusState].config.sendOnlyToGM = statusDefaults.config.sendOnlyToGM;
            }
            if(!state[statusState].config.hasOwnProperty('showDescOnStatusChange')){
                state[statusState].config.showDescOnStatusChange = statusDefaults.config.showDescOnStatusChange;
            }
            if(!state[statusState].config.hasOwnProperty('showIconInDescription')){
                state[statusState].config.showIconInDescription = statusDefaults.config.showIconInDescription;
            }
            if(!state[statusState].config.hasOwnProperty('showConditions')){
                state[statusState].config.showConditions = statusDefaults.config.showConditions;
            }            
        }

        // if(!state[statusState].hasOwnProperty('conditions')){
        //     state[statusState].conditions = statusDefaults.conditions;
        // }

//        sendConfigMenu();
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        ObserveTokenChange: observeTokenChange,
        getConditions,
        getConditionByKey,
        // handleConditions,
        sendConditionToChat,
        getIcon	
    };
})();

on('ready',function() {
    'use strict';

    CombatTracker.CheckInstall();
    CombatTracker.RegisterEventHandlers();
});
