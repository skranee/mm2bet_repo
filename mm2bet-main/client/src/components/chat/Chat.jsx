import React, { useState, useEffect, Fragment } from "react";
import { chatSocket } from "../../services/websocket.service";
import { getChatData } from "../../services/api.service";

// Components
import Header from "./Header";
import Messages from "./Messages";
import Controls from "./Controls";

const Chat = () => {
  // Declare State
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [rain, setRain] = useState(null);
  const [trivia, setTrivia] = useState(null);


  // Rain server state changed
  const rainStateChanged = newState => {
    setRain(newState);
  };

  // Trivia server state changed
  const triviaStateChanged = newState => {
    setTrivia(newState);
  };

  // Add new chat message to the state
  const addMessage = message => {
    // Update state
    setChatMessages(state =>
      state.length > 29
        ? [...state.slice(1, state.length), message]
        : [...state, message]
    );
  };

  // Remove message from state
  const removeMessage = msgId => {
    // Update state
    setChatMessages(state => state.filter(message => message.msgId !== msgId));
  };

  // Fetch chat messages from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getChatData();

      // Update state
      setChatMessages(response.messages);
      setRain(response.rain);
      setTrivia(response.trivia);
      setLoading(false);
    } catch (error) {
      console.log("There was an error while fetching chat messages:", error);
    }
  };

  // componentDidMount
  useEffect(() => {
    fetchData();

    // Listeners
    chatSocket.on("new-chat-message", addMessage);
    chatSocket.on("remove-message", removeMessage);
    chatSocket.on("rain-state-changed", rainStateChanged);
    chatSocket.on("trivia-state-changed", triviaStateChanged);

    // componentDidUnmount
    return () => {
      // Remove listeners
      chatSocket.off("new-chat-message", addMessage);
      chatSocket.off("remove-message", removeMessage);
      chatSocket.off("rain-state-changed", rainStateChanged);
      chatSocket.off("trivia-state-changed", triviaStateChanged);
    };
  }, []);

  return (
    <Fragment>
      <Header />
      <Messages loading={loading} chatMessages={chatMessages} />
      <Controls rain={rain} trivia={trivia} />
    </Fragment>
  );
};

export default Chat;
