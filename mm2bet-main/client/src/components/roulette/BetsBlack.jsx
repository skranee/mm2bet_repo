import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

// MUI Components
import Box from "@material-ui/core/Box";
import Avatar from "@material-ui/core/Avatar";
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@material-ui/core/Collapse';
import CountUp from 'react-countup';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 5,
    width: "100%",
    height: "auto",
    maxHeight: "800px", //new
    paddingLeft: "5px",
    paddingRight: "5px",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      marginTop: 20,
    },
  },
  betAmount: {
    width: "100%",
    height: "2.1rem",
    display: "flex",
    alignItems: "center",
    color: "#485261",
    fontFamily: "Rubik",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: ".1em",
    "& span": {
      display: "flex",
      marginLeft: "auto",
      fontFamily: "Rubik",
      fontSize: "12px",
      fontWeight: 500,
      letterSpacing: ".1em",
    },
  },
  bets: {
    display: "flex",
    color: "white",
    flexDirection: "column",
  },
  userlevel: {
    fontSize: 9,
    padding: "5px 7px",
    color: "#fff",
    fontFamily: "Rubik",
    fontWeight: 500,
    letterSpacing: ".15em",
    marginTop: "-4px",
    borderTopLeftRadius: "3px",
    borderBottomLeftRadius: "3px",
    borderRight: "1px solid #272b2f",
  },
  bet: {
    display: "flex",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 5,
    width: "100%",
    paddingTop: 15,
    color: "#e4e4e4",
    fontFamily: "Rubik",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: ".1em",
    position: "relative",
  },
  avatar: {
    height: 30,
    width: 30,
    borderRadius: "100%",
  },
  multiplier: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const Bets = ({ players, redResult, greenResult, blackResult }) => {
  const classes = useStyles();
  const [previousTotal, setPreviousTotal] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [blackBetsLength, setBlackBetsLength] = useState(0);
  let multiplier = 2;

  useEffect(() => {
    // Calculate the previous total when the players prop changes
    const newTotal = players.filter(player => player.color === "black").reduce((total, player) => {
      return total + parseFloat(player.betAmount);
    }, 0);

    let newBlackBetsLength = 0;
    players.forEach((player) => {
      if (player.color === "black") {
        newBlackBetsLength++;
      }
    });
    setBlackBetsLength(newBlackBetsLength);

    setPreviousTotal(currentTotal);
    setCurrentTotal(newTotal);
  }, [players]);

  return (
    <Box className={classes.root}>
      <Box className={classes.betAmount}>
        <span style={{ color: "#e4e4e4", marginLeft: 0, }}>{blackBetsLength} Bets</span>
        <span style={{ color: blackResult ? "#EE2472" : redResult || greenResult ? "#FCB122" : "rgb(255, 224, 99)", }}>
          <CountUp
            delay={0}
            duration={1}
            decimals={2}
            prefix={greenResult || redResult ? "-$ " : "$ "}
            start={previousTotal}
            end={blackResult ? currentTotal * multiplier : currentTotal}
          />
        </span>
      </Box>

      <Box className={classes.bets}>
        <TransitionGroup>
          {players.filter(player => player.color === "black").sort((a, b) => b.betAmount - a.betAmount).map((player, index) => (
            <Collapse key={index}>
              <Box key={player.betId}>
                <Box className={classes.bet}>
                  <Avatar
                    className={classes.avatar}
                    style={{ border: `2px solid ${player.level.levelColor}`, }}
                    src={player.avatar}
                    variant="rounded"
                  />
                  {<Box
                    style={{
                      padding: "3px 3px 3px 4px",
                      fontSize: "8px",
                      color: "#fff",
                      marginRight: "-8px",
                      marginLeft: "8px",
                      borderRadius: "5px",
                      background: `${player.level.levelColor}`,
                    }}
                    className="userlevel">{player.level.name}</Box>}
                  <Box ml={2} style={{ color: "rgb(152 152 152)", fontWeight: "500", fontFamily: "Rubik" }}>{player.username}</Box>
                  <Box ml="auto" style={player.betAmount.toFixed(2) >= 10 ? { color: "rgb(255, 224, 99)", } : { color: "#e4e4e4", }}>{greenResult || redResult ? "-" : ""}$ {blackResult ? (player.betAmount * multiplier).toFixed(2) : player.betAmount.toFixed(2)}</Box>
                </Box>
              </Box>
            </Collapse>
          ))}
        </TransitionGroup>
      </Box>
    </Box>
  );
};

Bets.propTypes = {
  players: PropTypes.array.isRequired,
};

export default Bets;
