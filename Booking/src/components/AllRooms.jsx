import React from "react";
import "./AllRooms.css";
import RoomCard from "./RoomDetails/RoomCard";
import { useState, useEffect } from "react";

const AllRooms = () => {
  const [roomData, setRoomData] = useState([]);

  useEffect(() => {
    async function fetchRoomData() {
      try {
        const response = await fetch(
          "https://backend-ko-roomdata-ko-page/rooms/",
          {
            method: "GET",
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch room data.");
        }
        const data = await response.json(); // Parse the JSON response
        setRoomData(data);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    }
    fetchRoomData();
  }, []);

  return(
    <div className="all-rooms-container">
        <h2>All Rooms</h2>
        <div className="rooms-list">
          {roomData.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
    </div>
  );
};

export default AllRooms;