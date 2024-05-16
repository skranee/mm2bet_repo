import React, { useState, useEffect, Fragment } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { useToasts } from "react-toast-notifications";
import PropTypes from "prop-types";
import {
  getUserVerificationData,
  sendVerificationCode,
  submitVerificationCode,
  checkAndVerifyUser,
} from "../../services/api.service";
import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_SITE_KEY } from "../../services/api.service";

// MUI Components
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";

import error from "../../assets/error.wav";
import success from "../../assets/success.wav";

const errorAudio = new Audio(error);
const successAudio = new Audio(success);

const playSound = audioFile => {
  audioFile.play();
};

// Custom Styles
const useStyles = makeStyles(theme => ({
  modal: {
    "& div > div": {
      background: "#212529",
      color: "#e4e4e4",
      fontFamily: "Rubik",
      fontSize: "14px",
      fontWeight: 500,
      letterSpacing: ".1em",
    },
    "& .MuiDialog-paperWidthSm": {
      width: "50%",
      [theme.breakpoints.down("xs")]: {
        width: "100%",
        margin: "15px",
      },
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        margin: "15px",
      },
      [theme.breakpoints.down("md")]: {
        width: "100%",
        margin: "15px",
      },
    },
  },
  vipTitle: {
    fontSize: 20,
    textAlign: "right",
    marginTop: "2rem",
    marginRight: "1rem",
    "& > span": {
      color: "#607d8b",
    },
  },
  vipDesc: {
    width: "90%",
    color: "#e4e4e4",
    fontFamily: "Rubik",
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: ".05em",
    textAlign: "center",
    margin: "2rem auto",
    "& > button": {
      color: "#e4e4e4",
      background: "none",
      border: "none",
      fontFamily: "inherit !important",
      cursor: "pointer",
      fontWeight: "inherit !important",
      textDecoration: "none",
      transition: "all .3s ease",
      "&:hover": {
        color: "#e4e4e4",
      },
    },
    "& > a": {
      color: "#e4e4e4",
      textDecoration: "none",
      transition: "all .3s ease",
      "&:hover": {
        color: "#e4e4e4",
      },
    },
    "& b": {
      color: "#FFC440",
      textDecoration: "none",
    },
  },
  progressbox: {
    margin: "0 1rem",
    position: "relative",
    "& > div > .MuiOutlinedInput-root": {
      background: "#282c33",
      "& > input": {
      },
    },
    "& > div": {
      width: "100%",
      "& label": {
        color: "#5f6368",
        fontFamily: "Rubik",
        fontSize: "14px",
        fontWeight: 500,
        letterSpacing: ".1em",
      },
      "& label.Mui-focused": {
        color: "#5f6368",
        fontFamily: "Rubik",
        fontSize: "14px",
        fontWeight: 500,
        letterSpacing: ".1em",
      },
      "& .MuiInput-underline:after": {
        borderBottomColor: "#5f6368",
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#5f6368",
        },
        "&:hover fieldset": {
          borderColor: "#5f6368",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#5f6368",
        },
      },
    },
    "& > button": {
      position: "absolute",
      right: 10,
      top: 10,
      width: "7rem",
      background: "#264d68",
      color: "#e4e4e4",
      "&:hover": {
        background: "#264d68",
      },
      "& .MuiButton-label": {
      },
    },
  },
  loader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "15rem",
  },
  loyaltyBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem 0 0 0",
    "& h4": {
      color: "#373c5c",
    },
    "& b": {
      color: "#5f679a",
      textDecoration: "none",
    },
    "& img": {
      height: "4rem",
      width: "auto",
      marginRight: "1rem",
    },
  },
  checkBtn: {
    background: "#273a4f",
    color: "white",
    "&:hover": {
      background: "#273a4f",
    },
    "& .MuiButton-label": {
    },
  },
  captcha: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "2rem 0 0 0",
  },
  buttontest: {
    color: "#e4e4e4",
    fontFamily: "Rubik",
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: ".1em",
  },
  titlerubik: {
    fontFamily: "Rubik",
  },
  egexample: {
    color: "#FF9800",
  },
}));

// Custom Styled Component
const ColorCircularProgress = withStyles({
  root: {
    color: "#4f79fd !important",
  },
})(CircularProgress);

const AccountVerificationModal = ({ open, handleClose }) => {
  // Declare State
  const classes = useStyles();
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(true);
  const [verificationType, setVerificationType] = useState(null);

  // Mobile checking state
  const [mobileNumber, setMobileNumber] = useState("");
  const [sending, setSending] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reCaptcha, setReCaptcha] = useState(null);

  // CS:GO checking state
  const [checking, setChecking] = useState(false);

  // Button onClick event handler
  const sendMessage = async () => {
    setSending(true);
    try {
      const response = await sendVerificationCode(mobileNumber, reCaptcha);

      // Update state
      setVerificationType("waitingsms");
      addToast(
        "Successfully sent your verification code to your phone number!",
        { appearance: "success" }
      );
      playSound(successAudio);
      console.log("Sent message to:", response.mobileNumber);
    } catch (error) {
      setSending(false);
      setReCaptcha(null);
      console.log(
        "There was an error while sending SMS to a phone number:",
        error
      );

      // If this was a validation error
      if (error.response && error.response.data && error.response.data.errors) {
        // Loop through errors
        error.response.data.errors.forEach(error =>
          addToast(error.msg, { appearance: "error" })
        );
        playSound(errorAudio);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        // User caused this error
        addToast(error.response.data.error, { appearance: "error" });
        playSound(errorAudio);
      } else {
        addToast(
          "There was an error while sending your verification code, please try again later!",
          { appearance: "error" }
        );
        playSound(errorAudio);
      }
    }
  };

  // Button onClick event handler
  const submitCode = async () => {
    setSubmitting(true);
    try {
      const response = await submitVerificationCode(verificationCode);

      // Update state
      if (response.success) {
        addToast("Successfully verified your account!", {
          appearance: "success",
        });
        handleClose();
        playSound(successAudio);
      }
    } catch (error) {
      setSubmitting(false);
      console.log("There was an error while submitting SMS code:", error);

      // If this was a validation error
      if (error.response && error.response.data && error.response.data.errors) {
        // Loop through errors
        error.response.data.errors.forEach(error =>
          addToast(error.msg, { appearance: "error" })
        );
        playSound(errorAudio);
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        // User caused this error
        addToast(error.response.data.error, { appearance: "error" });
        playSound(errorAudio);
      } else {
        addToast(
          "There was an error while submitting your verification code, please try again later!",
          { appearance: "error" }
        );
        playSound(errorAudio);
      }
    }
  };

  // Button onClick event handler
  const onClick = async () => {
    setChecking(true);
    try {
      const response = await checkAndVerifyUser();

      // Update state
      if (response.success) {
        addToast("Successfully verified your account!", {
          appearance: "success",
        });
        handleClose();
        playSound(successAudio);
      }
    } catch (error) {
      setChecking(false);
      console.log(
        "There was an error while checking user's steam inventory:",
        error
      );

      // If this was user's error
      if (error.response && error.response.data && error.response.data.error) {
        addToast(error.response.data.error, { appearance: "error" });
      } else {
        addToast(
          "There was an error while checking your steam inventory, please try again later!",
          { appearance: "error" }
        );
        playSound(errorAudio);
      }
    }
  };

  // TextField onChange event handler
  const onChange = e => {
    setMobileNumber(e.target.value);
  };

  // TextField onChange event handler
  const codeOnChange = e => {
    // Update state
    setVerificationCode(e.target.value);
  };

  // ReCAPTCHA onChange event handler
  const reCaptchaOnChange = value => {
    // Update state
    setReCaptcha(value);
  };

  // componentDidMount
  useEffect(() => {
    // Fetch verification data from api
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getUserVerificationData();

        // Update state
        setVerificationType(response.verificationType);
        setLoading(false);

        // If user is already verified, close modal
        if (response.hasVerifiedAccount) {
          addToast("You have already verified your account!", {
            appearance: "info",
          });
          handleClose();
          playSound(errorAudio);
        }

        // If phone number is submitted, change it to that
        if (
          response.verificationType === "textmessage" &&
          response.verifiedPhoneNumber
        ) {
          setMobileNumber(response.verifiedPhoneNumber);
          setVerificationType("waitingsms");
        }
      } catch (error) {
        console.log("Error while getting user verification data:", error);
        addToast(
          "There was an error while getting your verification information, please try again later!",
          { appearance: "error" }
        );
        playSound(errorAudio);
      }
    };

    if (open) fetchData();
  }, [handleClose, addToast, open]);

  // When modal is re-opened, reset state
  useEffect(() => {
    if (open) {
      setMobileNumber("");
      setSending(false);
      setReCaptcha(null);
    }
  }, [open]);

  return (
    <Dialog
      className={classes.modal}
      onClose={handleClose}
      open={open}
      style={{ fontFamily: "Rubik", }}
    >
      <DialogTitle className={classes.titlerubik} style={{ fontFamily: "Rubik", }} onClose={handleClose}>
        <span style={{ fontFamily: "Rubik", }}>VERIFY YOUR ACCOUNT</span>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box className={classes.loader}>
            <ColorCircularProgress />
          </Box>
        ) : verificationType === "waitingsms" ? (
          <Fragment>
            <h4 className={classes.vipDesc}>
              We have sent a SMS Verification code to <b>{mobileNumber}</b>.
            </h4>
            <Box position="relative" className={classes.progressbox}>
              <TextField
                className="input"
                variant="outlined"
                label="SMS VERIFICATION CODE"
                inputProps={{ readOnly: false, "aria-readonly": false }}
                value={verificationCode}
                onChange={codeOnChange}
              />
              <Button
                className="saveBtn"
                variant="contained"
                onClick={submitCode}
              >
                {submitting ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </Box>
            <h4 className={classes.vipDesc}>
              Please allow up to 5 minutes for the message to arrive.
              <button onClick={() => setVerificationType("textmessage")}>
                Send again
              </button>{" "}
              After you have the verification code, submit it above to verify
              your account.
            </h4>
          </Fragment>
        ) : verificationType === "textmessage" ? (
          <Fragment>
            <Box position="relative" className={classes.progressbox}>
              <TextField
                className="input"
                variant="outlined"
                label="YOUR PHONE NUMBER"
                inputProps={{ readOnly: false, "aria-readonly": false }}
                value={mobileNumber}
                onChange={onChange}
              />
              <Button
                className="saveBtn"
                variant="contained"
                onClick={sendMessage}
                disabled={sending || !reCaptcha}
              >
                {sending ? "SENDING..." : "SEND"}
              </Button>
            </Box>
            {!sending && (
              <ReCAPTCHA
                className={classes.captcha}
                onChange={reCaptchaOnChange}
                sitekey={RECAPTCHA_SITE_KEY}
              />
            )}
            <h4 className={classes.vipDesc}>
              In order to verify your account, we will send a{" "}
              <b>6-digit SMS code</b> to your phone number. Please enter your
              working phone number with the corresponding country code <span className={classes.egexample}>(example: +14045964682 for US number)</span>
            </h4>
          </Fragment>
        ) : verificationType === "loyaltybadge" ? (
          <Fragment>
            <Box className={classes.loyaltyBox}>
              <Button
                className={classes.checkBtn}
                variant="contained"
                onClick={onClick}
              >
                {checking ? "CHECKING..." : "CHECK YOUR STEAM INVENTORY"}
              </Button>
            </Box>
            <Box className={classes.loyaltyBox}>
              <img
                src="https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXQ9Q1LO5kNoBhSQl-fV_ak2srsUVxwIgEZ5rikLgYy0KeZdTtHuoW1xteNx6LxMejTlD0BsZ0l07vHoNnw0FKy_F0sPT4FlIcnBQ"
                alt="CS:GO Loyalty Badge"
              />
              <h4>
                In order to verify your account, you must set your Steam
                inventory privacy settings to public and have{" "}
                <b>CS:GO Loyalty Badge</b> in your inventory. Click check to
                verify your account.
              </h4>
            </Box>
          </Fragment>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} className={classes.buttontest} color="primary">
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AccountVerificationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  link: PropTypes.string,
};

export default AccountVerificationModal;
