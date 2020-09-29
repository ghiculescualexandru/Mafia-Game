import React, { Component } from "react";

import mafiaLogo from "../img/mafia.png";
import copLogo from "../img/cop.png";
import mutilatorLogo from "../img/mutilator.jpg";
import medicLogo from "../img/medic.jpg";
import busDriverLogo from "../img/bus-driver.jpg";
import gameLogo from "../img/logo.png";

let currentRoles; /** Active roles in the current game. */
let playerPopup; /** Player picking his role. */
let rolePopup; /** Role picked by player. */
let playersAlive = {}; /** Active players in the current game. */

export default class Mafia extends Component {
  state = {
    defaultName: "Mafia" /** Game name. */,
    playersNumber: 0 /** Number of players. */,
    players: [] /** Current players. */,
    playersPicking: [] /** Players who need to pick their role. */,
    finishedAddPlayers: false /** For the "add players" phase. */,
    gameBegun: false /** After the "add palyers" phase. */,
    rolesPicked: false /** After the "pick your role" phase. */,
    canStartStory: false /** After the last role was picked. */,
    startedStory: false /** After the "start the story" button clicked. */,
    startedNight: false /** After "see night results" button clicked. */,
    roles: {
      /** Dictionary to know which roles are used. */ 
      mafia: false,
      cop: false,
      mutilator: false,
      arsonist: false,
      "bus-driver": false,
      medic: false,
    },
    currentRoles: [] /** Roles chosen. */,
    showPopup: false /** Boolean to display and close popups. */,
    currentDeadPlayer: "" /** The player who died and lost. */,
    currentCheckedPlayer: "" /** The player checked by the cop. */,
    currentAttackedPlayer: "" /** The player attacked by mutilator. */,
    currentAttack: "" /** The attack by the mutilator: hand or mouth. */,
  };

  render() {
    return (
      <React.Fragment>
        <div id="game-container">
          {/* Header + Title */}
          <div>{this.createHeader()}</div>
          <div id="container">
            {/* Add players button (+ btn) + number of players */}
            <div>{this.renderPlayersAddButton()}</div>
            {/* List of players dynamic */}
            <div id="finished-list">
              <div id="finished-list">{this.renderPlayerList()}</div>
              <div id="finished-list">{this.renderInputList()}</div>
            </div>
            {/* Finish button */}
            <div>{this.createFinishButton()}</div>
            {/* Displaying roles to pick */}
            <div>{this.displayRoles()}</div>
            {/* Begin game button */}
            <div>{this.createBeginButton()}</div>
            {/* Pick roles button */}
            <div>{this.createPickRolesButton()}</div>
            {/* Debug ONLY! */}
            <div>{this.debug()}</div>
          </div>
        </div>
        {/* Find your role button and popup to find the role. */}
        <div>{this.findYourRole()}</div>
        <div>{this.createPopup()}</div>
        <div id="story-container">
          <div>{this.displayPlayersAlive()}</div>
          <div>{this.createStoryTellingButton()}</div>
          <div id="mafia-night">{this.mafiaNight()}</div>
          <div id="cop-night">
            {this.copNight()}
            {this.createCopButton()}
            {this.displayCopResults()}
          </div>
          <div id="mutilator-night">{this.mutilatorNight()}</div>
          <div id="medic-night">{this.medicNight()}</div>
          <div id="bus-driver-night">{this.busDriverNight()}</div>
          <div>{this.clearContentButton()}</div>
          <div>{this.nightResultsButton()}</div>
          <div>{this.displayDeadPlayer()}</div>
          <div>{this.displayMutilatedPlayer()}</div>
        </div>
        {/* Reset button */}
        <div>{this.createResetButton()}</div>
      </React.Fragment>
    );
  }

  /****************************************************/
  /** ADD and DELETE PLAYERS. *************************/
  /**
   * Method to add player.
   */
  handleAddPlayer = (name) => {
    name.preventDefault();
    let players = this.state.players.concat([""]);
    this.setState({
      players,
      playersNumber: this.state.playersNumber + 1,
    });
  };
  /**
   * Method to delete player.
   */
  handleDeletePlayer = (i) => (e) => {
    e.preventDefault();
    let players = [
      ...this.state.players.slice(0, i),
      ...this.state.players.slice(i + 1),
    ];
    this.setState({
      players,
      playersNumber: this.state.playersNumber - 1,
    });
  };
  /**
   * Handle change of text in input box.
   */
  handleText = (i) => (e) => {
    let players = [...this.state.players];
    players[i] = e.target.value;
    this.setState({
      players,
    });
  };
  /**
   * Setting the state after adding the players.
   */
  handleFinishAddPlayers = () => {
    this.setState({
      finishedAddPlayers: true,
    });
  };
  /**
   * Method to render and display players list.
   */
  renderInputList = () => {
    if (this.state.finishedAddPlayers || !this.state.playersNumber) {
      return;
    }

    return (
      <React.Fragment>
        {this.state.players.map((player, index) => (
          <span key={index}>
            <input
              type="text"
              onChange={this.handleText(index)}
              value={player}
            />
            <button onClick={this.handleDeletePlayer(index)}>x</button>
          </span>
        ))}
      </React.Fragment>
    );
  };
  /**
   * Method to display final players list, read only.
   */
  renderPlayerList() {
    if (this.state.players.length === 0) {
      return <p>You need to add some players.</p>;
    } else if (this.state.finishedAddPlayers) {
      return (
        <React.Fragment>
          The players are:
          {this.state.players.map((player, index) => (
            <span key={index}>
              <input
                readOnly
                type="text"
                onChange={this.handleText(index)}
                value={player}
              />
            </span>
          ))}
        </React.Fragment>
      );
    }
  }
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** RESET BUTTON. ***********************************/
  /**
   * Method to clear every input and reset all
   * values for the game state.
   */
  handleReset = () => {
    document.getElementById("game-container").style.display = "";
    currentRoles = [];

    let roles = {
      mafia: false,
      cop: false,
      mutilator: false,
      arsonist: false,
      "bus-driver": false,
      medic: false,
    };

    this.setState({
      playersNumber: 0,
      players: [],
      roles,
      currentRoles: [],
      finishedAddPlayers: false,
      gameBegun: false,
      rolesPicked: false,
      canStartStory: false,
      startedStory: false,
      startedNight: false,
      currentCheckedPlayer: "",
      currentAttack: "",
      currentAttackedPlayer: "",
      currentDeadPlayer: "",
    });
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** DISPLAY AND PICK ROLES. *************************/
  /**
   * Method to display all roles available with
   * cheboxes along them, ready to be picked. Also,
   * it displayes the final roles before beggining
   * the picking roles phase.
   */
  displayRoles = () => {
    if (!this.state.finishedAddPlayers) {
      return;
    }

    if (this.state.gameBegun) {
      return (
        <React.Fragment>
          Here are the roles:
          {this.getCurrentRoles().map((role) => (
            <li>{role}</li>
          ))}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        You need to pick maximum {this.state.playersNumber} roles. <br></br>
        <div id="display-roles-container">
          <div id="mafia-container">
            <div class="ui checkbox">
              <input
                type="checkbox"
                onChange={this.changeCheckboxMafia}
                class="hidden"
                readonly=""
                tabindex="0"
              />
            </div>
            <img src={mafiaLogo} alt="" width="25" height="25" />
            <div id="mafia-text"> Mafia </div>
          </div>
          <div id="cop-container">
            <div class="ui checkbox">
              <input
                type="checkbox"
                onChange={this.changeCheckboxCop}
                class="hidden"
                readonly=""
                tabindex="0"
              />
            </div>
            <img src={copLogo} alt="" width="25" height="25" />
            <div id="cop-text"> Cop </div>
          </div>
          {/* <div id="arsonist-container">
            <div class="ui checkbox">
              <input
                type="checkbox"
                onChange={this.changeCheckboxArsonist}
                class="hidden"
                readonly=""
                tabindex="0"
              />
            </div>
            <img src={arsonistLogo} width="25" height="25" />
            <div id="arsonist-text"> Arsonist </div>
          </div> */}
          <div id="mutilator-container">
            <div class="ui checkbox">
              <input
                type="checkbox"
                onChange={this.changeCheckboxMutilator}
                class="hidden"
                readonly=""
                tabindex="0"
              />
            </div>
            <img src={mutilatorLogo} alt="" width="25" height="25" />
            <div id="mutilator-text"> Mutilator </div>
          </div>
          <div id="bus-driver-container">
            <div class="ui checkbox">
              <input
                type="checkbox"
                onChange={this.changeCheckboxBusDriver}
                class="hidden"
                readonly=""
                tabindex="0"
              />
            </div>
            <img src={busDriverLogo} alt="" width="25" height="25" />
            <div id="bus-driver-text"> Bus-Driver </div>
          </div>
          <div id="medic-container">
            <div class="ui checkbox">
              <input
                type="checkbox"
                onChange={this.changeCheckboxMedic}
                class="hidden"
                readonly=""
                tabindex="0"
              />
            </div>
            <img src={medicLogo} alt="" width="25" height="25" />
            <div id="Medic-text"> Medic </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** MANAGING CHECKBOXES. ****************************/
  /**
   * Following methods change boolean values in a
   * dictionary so that if a checkbox is selected,
   * its value is set to true. When deselected, its
   * value is set to false.
   */
  changeCheckboxMafia = () => {
    let roles = this.state.roles;
    roles["mafia"] = !roles["mafia"];
    this.setState({
      roles,
    });
  };

  changeCheckboxCop = () => {
    let roles = this.state.roles;
    roles["cop"] = !roles["cop"];
    this.setState({
      roles,
    });
  };

  changeCheckboxMedic = () => {
    let roles = this.state.roles;
    roles["medic"] = !roles["medic"];
    this.setState({
      roles,
    });
  };

  changeCheckboxBusDriver = () => {
    let roles = this.state.roles;
    roles["bus-driver"] = !roles["bus-driver"];
    this.setState({
      roles,
    });
  };

  changeCheckboxArsonist = () => {
    let roles = this.state.roles;
    roles["arsonist"] = !roles["arsonist"];
    this.setState({
      roles,
    });
  };

  changeCheckboxMutilator = () => {
    let roles = this.state.roles;
    roles["mutilator"] = !roles["mutilator"];
    this.setState({
      roles,
    });
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** MODIFY STATES. **********************************/
  beginGame = () => {
    if (!this.checkRoles()) {
      console.log("nu e bine cu rolurile");
    }

    document.getElementById("begin-game-button").style.display = "none";

    let currentRoles = this.getCurrentRoles();
    this.setState({
      currentRoles,
      gameBegun: true,
    });
  };

  startStoryTelling = () => {
    this.setState({
      startedStory: true,
      startedNight: true,
    });
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** PICKING RANDOM ROLES. ***************************/
  /**
   * Method to check roles before continuing and picking.
   */
  checkRoles = () => {
    return true;
  };
  /**
   * Returns a list of roles filled with villagers
   * if needed.
   */
  getCurrentRoles = () => {
    let currentRoles = [];
    for (var role in this.state.roles) {
      if (this.state.roles[role]) {
        currentRoles.push(role);
      }
    }

    let len = this.state.players.length - currentRoles.length;
    for (let i = 0; i < len; i++) {
      currentRoles.push("villager");
    }

    return currentRoles;
  };
  /**
   * Method to hide the first page when roles are to be picked.
   */
  pickRoles = () => {
    document.getElementById("game-container").style.display = "none";
    currentRoles = this.state.currentRoles;
    this.setState({
      rolesPicked: true,
      playersPicking: this.state.players,
    });
  };
  /**
   * Method to create and handle the
   * "pick your role" button.
   */
  findYourRole = () => {
    if (!this.state.rolesPicked) {
      return;
    }

    return (
      <React.Fragment>
        <div id="picking-roles-list">
          {this.state.playersPicking.map((player, index) => (
            <span id="picking-role" key={index}>
              {player}
              <button
                className="btn btn-secondary btn-sm m-2"
                id="find-your-role-button"
                onClick={this.randomRole(player, index)}
              >
                Find your role.
              </button>
            </span>
          ))}
        </div>
      </React.Fragment>
    );
  };
  /**
   * Method to pick a random role for a player
   * which handles the last player picking, displaying
   * a "start the story" button.
   */
  randomRole = (player, i) => (e) => {
    playerPopup = player;

    e.preventDefault();
    let playersPicking = [
      ...this.state.playersPicking.slice(0, i),
      ...this.state.playersPicking.slice(i + 1),
    ];

    this.setState({
      showPopup: !this.state.showPopup,
      playersPicking,
    });

    if (this.state.playersPicking.length <= 1) {
      document.getElementById("game-container").style.display = "none";
      document.getElementById("pick-roles-button").style.display = "none";
      this.setState({
        canStartStory: true,
      });
    }
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** DISPLAY PLAYERS ALIVE. **************************/
  /**
   * Method to display in real time the players alive
   * during a game
   */
  displayPlayersAlive = () => {
    if (!this.state.startedStory) {
      return;
    }

    document.getElementById("start-story-button").style.display = "none";
    return (
      <React.Fragment>
        <img id="game-logo" src={gameLogo} alt="" /> <br></br>
        Players alive:
        {this.state.players.map((player) => (
          <li>{player}</li>
        ))}
      </React.Fragment>
    );
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** NIGHT INPUT HANDLER. ****************************/
  /**
   * Method to handle mafia night input.
   */
  mafiaNight = () => {
    if (!this.state.startedNight || !this.getCurrentRoles().includes("mafia")) {
      return;
    }

    return (
      <React.Fragment>
        Mafia kills:
        <input id="mafia-input" type="text" size="4"></input>
      </React.Fragment>
    );
  };
  /**
   * Method to handle medic night input.
   */
  medicNight = () => {
    if (!this.state.startedNight || !this.getCurrentRoles().includes("medic")) {
      return;
    }

    return (
      <React.Fragment>
        Medic heals:
        <input id="medic-input" type="text" size="4"></input>
      </React.Fragment>
    );
  };
  /**
   * Method to handle cop night input.
   */
  copNight = () => {
    if (!this.state.startedNight || !this.getCurrentRoles().includes("cop")) {
      return;
    }

    return (
      <React.Fragment>
        Cop checks:
        <input id="cop-input" type="text" size="4"></input>
      </React.Fragment>
    );
  };
  /**
   * Method that check a player's status.
   */
  copCheckingPlayer = () => {
    let res = "";
    let checkedPlayer = document.getElementById("cop-input").value;
    // console.log(playersAlive);
    if (playersAlive[checkedPlayer] === "mafia") {
      res = "Status: bad";
    } else {
      res = "Status: good";
    }

    this.setState({
      currentCheckedPlayer: res,
    });
  };
  /**
   * Method to handle mutilator night input.
   */
  mutilatorNight = () => {
    if (
      !this.state.startedNight ||
      !this.getCurrentRoles().includes("mutilator")
    ) {
      return;
    }

    return (
      <React.Fragment>
        Mutilator:
        <input id="mutilator-input" type="text" size="4"></input>
        <input
          id="hand"
          type="checkbox"
          onChange={this.handAttack}
          class="hidden"
          readonly=""
          tabindex="0"
        />{" "}
        hand
        <input
          id="mouth"
          type="checkbox"
          onChange={this.mouthAttack}
          class="hidden"
          readonly=""
          tabindex="0"
        />{" "}
        mouth
      </React.Fragment>
    );
  };
  /**
   * Method to handle checkboxes for mutilator.
   */
  handAttack = () => {
    document.getElementById("mouth").checked = false;
    this.setState({
      currentAttack: "hand",
    });
  };
  /**
   * Method to handle checkboxes for mutilator.
   */
  mouthAttack = () => {
    document.getElementById("hand").checked = false;
    this.setState({
      currentAttack: "mouth",
    });
  };
  /**
   * Method to handle bus-driver night input.
   */
  busDriverNight = () => {
    if (
      !this.state.startedNight ||
      !this.getCurrentRoles().includes("bus-driver")
    ) {
      return;
    }

    return (
      <React.Fragment>
        BusDriver swaps:
        <input id="bus-driver-input-1" type="text" size="4"></input>
        <input id="bus-driver-input-2" type="text" size="4"></input>
      </React.Fragment>
    );
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** CALCULATE NIGHT RESULTS. ************************/
  /**
   * Method to compute the results of one night
   * depending on the input of the story teller.
   */
  getNightResults = () => {
    let dead = "",
      heal = "",
      attacked = "",
      swap1 = "",
      swap2 = "";
    if (this.getCurrentRoles().includes("mafia")) {
      dead = document.getElementById("mafia-input").value;
    }

    if (this.getCurrentRoles().includes("medic")) {
      heal = document.getElementById("medic-input").value;
    }

    if (this.getCurrentRoles().includes("mutilator")) {
      attacked = document.getElementById("mutilator-input").value;
    }

    if (this.getCurrentRoles().includes("bus-driver")) {
      swap1 = document.getElementById("bus-driver-input-1").value;
      swap2 = document.getElementById("bus-driver-input-2").value;
    }

    let players = this.state.players;

    if (dead === swap1) {
      dead = swap2;
    } else if (dead === swap2) {
      dead = swap1;
    }

    if (attacked === swap1) {
      attacked = swap2;
    } else if (attacked === swap2) {
      attacked = swap1;
    }

    if (dead !== heal) {
      for (let i = 0; i < players.length; i++) {
        if (players[i] === dead) {
          players.splice(i, 1);
        }
      }
    } else {
      dead = "none";
    }

    if (attacked === heal) {
      attacked = "none";
    }

    this.setState({
      players,
      currentDeadPlayer: dead,
      currentAttackedPlayer: attacked,
    });
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** DISPLAY NIGHT RESULTS. **************************/
  /**
   * Method to display the status of the player
   * checked by the cop. It displays "good" or "bad".
   */
  displayCopResults = () => {
    return (
      <React.Fragment>
        <div id="cop-status-check">{this.state.currentCheckedPlayer}</div>
      </React.Fragment>
    );
  };
  /**
   * Method to display the player who died
   * during the night or to show that no one
   * died yet. Also, it returns if the
   * City or Mafia won the game.
   */
  displayDeadPlayer = () => {
    if (this.state.currentDeadPlayer === "") {
      return;
    }

    if (this.state.currentDeadPlayer === "none") {
      return <React.Fragment>No one died.</React.Fragment>;
    }

    if (playersAlive[this.state.currentDeadPlayer] === "mafia") {
      return <React.Fragment>City won!</React.Fragment>;
    }

    if (this.state.players.length <= 2) {
      return <React.Fragment>Mafia won!</React.Fragment>;
    }

    return (
      <React.Fragment>{this.state.currentDeadPlayer} died.</React.Fragment>
    );
  };
  /**
   * Method to display the mutilated player with
   * its attack or to show that no one was harmed
   * during the night.
   */
  displayMutilatedPlayer = () => {
    if (this.state.currentAttackedPlayer === "") {
      return;
    }

    if (this.state.currentAttackedPlayer === "none") {
      return <React.Fragment>No one mutilated.</React.Fragment>;
    }

    return (
      <React.Fragment>
        {this.state.currentAttackedPlayer} has no {this.state.currentAttack}
      </React.Fragment>
    );
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** CLEAR INPUT CONTENT. ***************************/
  /**
   * Method to clear any input for the
   * night results and calculations.
   */
  clearContent = () => {
    if (this.getCurrentRoles().includes("mafia"))
      document.getElementById("mafia-input").value = "";
    if (this.getCurrentRoles().includes("cop"))
      document.getElementById("cop-input").value = "";
    if (this.getCurrentRoles().includes("medic"))
      document.getElementById("medic-input").value = "";
    if (this.getCurrentRoles().includes("bus-driver")) {
      document.getElementById("bus-driver-input-1").value = "";
      document.getElementById("bus-driver-input-2").value = "";
    }
    if (this.getCurrentRoles().includes("mutilator")) {
      document.getElementById("mutilator-input").value = "";
      document.getElementById("mouth").checked = false;
      document.getElementById("hand").checked = false;
    }

    this.setState({
      currentCheckedPlayer: "",
    });
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** CREATING BUTTONS. *******************************/
  /**
   * Method to create add player button (+) and to
   * display the current number of players.
   */
  renderPlayersAddButton = () => {
    return (
      <React.Fragment>
        <span>{this.formatPlayersNumber()}</span>
        <button
          disabled={this.state.finishedAddPlayers}
          onClick={this.handleAddPlayer}
          className="btn btn-secondary btn-sm m-2"
        >
          +
        </button>
      </React.Fragment>
    );
  };
  /**
   * Method to create the "Reset" button.
   */
  createResetButton = () => {
    return (
      <React.Fragment>
        <button
          id="reset-button"
          onClick={this.handleReset}
          className="btn btn-primary btn-sm m-2"
        >
          Reset
        </button>
      </React.Fragment>
    );
  };
  /**
   * Method to create the "Finish" button.
   */
  createFinishButton = () => {
    return (
      <React.Fragment>
        <button
          onClick={this.handleFinishAddPlayers}
          className="btn btn-primary btn-sm m-2"
        >
          Finish
        </button>
      </React.Fragment>
    );
  };
  /**
   * Method to create "Continue" button.
   */
  createBeginButton = () => {
    if (!this.state.finishedAddPlayers) {
      return;
    }

    return (
      <React.Fragment>
        <button
          id="begin-game-button"
          className="btn btn-primary btn-sm m-2"
          onClick={this.beginGame}
        >
          Continue
        </button>
      </React.Fragment>
    );
  };
  /**
   * Method to create the "Pick roles" button.
   */
  createPickRolesButton = () => {
    if (!this.state.gameBegun) {
      return;
    }

    return (
      <React.Fragment>
        <button
          id="pick-roles-button"
          className="btn btn-primary btn-sm m-2"
          onClick={this.pickRoles}
        >
          Pick roles
        </button>
      </React.Fragment>
    );
  };
  /**
   * Methood to create the "Start the story" button.
   */
  createStoryTellingButton = () => {
    if (!this.state.canStartStory) {
      return;
    }

    return (
      <React.Fragment>
        <button
          id="start-story-button"
          className="btn btn-secondary btn-sm m-2"
          onClick={this.startStoryTelling}
        >
          Start the story!
        </button>
      </React.Fragment>
    );
  };
  /**
   * Method to create the "check player" button
   * for the cop.
   */
  createCopButton = () => {
    if (!this.state.startedNight || !this.getCurrentRoles().includes("cop")) {
      return;
    }

    return (
      <React.Fragment>
        <button id="cop-input-button" onClick={this.copCheckingPlayer}>
          Check player
        </button>
      </React.Fragment>
    );
  };
  /**
   * Method to create the "See night results" button.
   */
  nightResultsButton = () => {
    if (!this.state.startedNight) {
      return;
    }

    return (
      <React.Fragment>
        <button
          id="night-results-button"
          className="btn btn-secondary btn-sm m-2"
          onClick={this.getNightResults}
        >
          See night results
        </button>
      </React.Fragment>
    );
  };
  /**
   * Method to create the "Clear Content" button.
   */
  clearContentButton = () => {
    if (!this.state.startedStory) {
      return;
    }

    return (
      <React.Fragment>
        <button
          id="clear-text-button"
          className="btn btn-secondary btn-sm m-2"
          onClick={this.clearContent}
        >
          Clear text
        </button>
      </React.Fragment>
    );
  };
  /****************************************************
   ****************************************************/

  /****************************************************/
  /** HELPER METHODS. *********************************/
  /**
   * Method to create a Popup for finding your role.
   */
  createPopup = () => {
    return (
      <React.Fragment>
        {this.state.showPopup ? (
          <Popup text="Close Me" closePopup={this.togglePopup.bind(this)} />
        ) : null}
      </React.Fragment>
    );
  };
  /**
   * Method to create the header: title game + logo.
   */
  createHeader = () => {
    return (
      <React.Fragment>
        <img id="game-logo" src={gameLogo} alt="" />
        <h1 id="game-name" className={this.getBadgeClasses()}>
          {this.state.defaultName}
        </h1>
      </React.Fragment>
    );
  };
  /**
   * Method for the title game design.
   */
  getBadgeClasses = () => {
    return "badge m-2 badge-warning";
  };
  /**
   * Method to display the number of players when
   * adding new players.
   */
  formatPlayersNumber = () => {
    const { playersNumber } = this.state;
    return playersNumber === 0 ? "No players" : playersNumber;
  };

  /**
   *  Method to change the state for displaying
   *  and closing popups.
   */
  togglePopup() {
    this.setState({
      showPopup: !this.state.showPopup,
    });
  }
  /****************************************************
   ****************************************************/

  /****************************************************
   * DEBUG POURPOSE ONLY.
   */
  debug = () => {
    console.log(playersAlive);
  };
  /****************************************************/
}

/****************************************************/
/** CLASS FOR POPUP. ********************************/
class Popup extends React.Component {
  render() {
    return (
      <div className="popup">
        <div className="popup_inner">
          <h3 id="popup-text">Your role is: {extractCurrentRole()}</h3>
          <button
            id="popup-close"
            className="btn btn-secondary btn-sm m-2"
            onClick={this.props.closePopup}
          >
            Close me!
          </button>
        </div>
      </div>
    );
  }
}

/****************************************************/
/** EXTRACTING A RANDOM ROLE. ***********************/
/**
 * Method to shuffle an array.
 */
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
/**
 * Random picking a role and extracts it.
 */
function extractCurrentRole() {
  shuffle(currentRoles);
  rolePopup = currentRoles.pop();
  playersAlive[playerPopup] = rolePopup;

  return rolePopup;
}
/****************************************************
 ****************************************************/
