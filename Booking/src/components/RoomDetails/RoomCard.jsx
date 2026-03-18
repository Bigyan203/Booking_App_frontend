import React, { useContext, useState } from "react";
import RoomImageSlider from "./RoomImageSlider";
import RoomInfo from "./Roominfo";

import "./RoomDetails.css";
import { UserContext } from "../UserContext";
import { redirect, useNavigate } from "react-router-dom";

const RoomCard = ({ room, selectedDateRange, onBookingSuccess }) => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [bookingError, setBookingError] = useState("");
  const handleBooking = async (roomId, userId, selectedDateRange) => {
    if (!user) {
      return navigate("/auth");
    }
    console.log(user.token);
    const baseURL = "http://localhost:8000";
    const roomUrl = `${baseURL}/rooms/${roomId}/`;
    const userUrl = `${baseURL}/users/${userId}/`;

    if (selectedDateRange.startDate && !selectedDateRange.endDate) {
      selectedDateRange.endDate = selectedDateRange.startDate;
    }
    for (
      let currentDate = new Date(selectedDateRange.startDate);
      currentDate <= new Date(selectedDateRange.endDate);
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      try {
        const isoDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000).toISOString().split("T")[0];

        const response = await fetch(`${baseURL}/occupied_dates/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
          body: JSON.stringify({
            room: roomUrl, // Full URL rakne kun room ko ho like rooms/1/
            user: userUrl, // Full rakne, user ko lai diff fdiff /users/2/
            date: isoDate
              //.toLocaleDateString("hu")
              //.replace(/\./g, "-")
              //.replace(/\s+/g, "") // Format date as dd-MM-YYYY
              //.slice(0, -1), // yo chaidaina
          }),
        });
        console.log(user);
        console.log(response);
        console.log(
          roomUrl,
          userUrl,
          isoDate
           // .toLocaleDateString("hu")
           // .replace(/\./g, "-")
           // .replace(/\s+/g, "") //mathi ko jstai
           // .slice(0, -1)
        ); 
        if (!response.ok) {
          console.log("Booking failed with status:", response.status);
          console.log("Response:", response);
          if (response.status === 409 || response.status === 400) {
            throw new Error("This room is already booked for the selected dates.");
          } else {
            throw new Error("Booking failed. Please try again.");
          }
        }
        const data = await response.json(); // Parse the JSON response
        onBookingSuccess();
        console.log("Booking successful:", data);
      } catch (error) {
        console.error("Error during booking:", error);
        setBookingError(error.message);
        // Clear error after 5 seconds
        setTimeout(() => setBookingError(""), 5000);
      }
    }
  };
  return (
    <div className="room-card">
      <RoomImageSlider images={room.images} />
      <RoomInfo room={room} />
      {bookingError && <div className="booking-error">{bookingError}</div>}
      {selectedDateRange ? (
        user ? (
          <button
            className="book-room-button"
            onClick={() =>
              handleBooking(room.id, user.user.id, selectedDateRange)
            }
            disabled={!selectedDateRange.startDate}
          >
            Book Room
          </button>
        ) : (
          <button
            className="book-room-button"
            onClick={() => navigate("/auth")}
          >
            Login to Book
          </button>
        )
      ) : null}
    </div>
  );
};

export default RoomCard;
