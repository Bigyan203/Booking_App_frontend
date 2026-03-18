import React, { useState, useEffect, useContext } from "react";
import "./OccupiedDatesDisplay.css";
import { UserContext } from "./UserContext";

const OccupiedDatesDisplay = () => {
  const [groupedDates, setGroupedDates] = useState({});
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    console.log(user);
    if (!user) {
      return;
    }

    const baseURL = "http://localhost:8000";
    async function fetchDates() {
      try {
        const response = await fetch(`${baseURL}/occupied_dates/?user=${user.user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Fetch failed");
        }
        console.log(user.token);
        const data = await response.json(); // Parse the JSON response
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error during fetching dates:", error);
        return []; // Return an empty array if fetch fails
      }
    }

    async function processAndSetDates() {
      const fetchedDates = await fetchDates(); // Wait for fetchDates to resolve

      // Process dates into grouped ranges by room
      const processDates = async (dates) => {
        // Group dates by room first
        const datesByRoom = {};
        
        for (const entry of dates) {
          const roomId = entry.room.split('/').slice(-2)[0]; // Extract room ID from URL
          
          if (!datesByRoom[roomId]) {
            // Fetch room details
            try {
              const roomResponse = await fetch(entry.room, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Token ${user.token}`,
                },
              });
              const roomData = await roomResponse.json();
              datesByRoom[roomId] = {
                roomName: roomData.name,
                dates: []
              };
            } catch (error) {
              console.error("Error fetching room:", error);
              datesByRoom[roomId] = {
                roomName: `Room ${roomId}`,
                dates: []
              };
            }
          }
          
          datesByRoom[roomId].dates.push(entry.date);
        }

        // Now create ranges for each room
        const ranges = {};
        
        for (const [roomId, roomInfo] of Object.entries(datesByRoom)) {
          const sortedDates = roomInfo.dates.sort();
          
          let currentRange = null;
          
          sortedDates.forEach((dateStr) => {
            const date = new Date(`${dateStr}T00:00:00`);
            
            if (isNaN(date.getTime())) {
              console.error("Invalid date:", dateStr);
              return;
            }

            const month = date.toLocaleString("en-GB", {
              month: "long",
              year: "numeric",
            });

            if (!ranges[month]) ranges[month] = [];
            
            if (!currentRange || currentRange.roomId !== roomId) {
              // Start new range for this room
              currentRange = { 
                startDate: dateStr, 
                endDate: dateStr, 
                roomName: roomInfo.roomName,
                roomId: roomId
              };
              ranges[month].push(currentRange);
            } else {
              // Check if date is consecutive
              const prevDate = new Date(`${currentRange.endDate}T00:00:00`);
              prevDate.setDate(prevDate.getDate() + 1);
              
              if (date.toISOString().split("T")[0] === prevDate.toISOString().split("T")[0]) {
                // Extend current range
                currentRange.endDate = dateStr;
              } else {
                // Start new range for same room
                currentRange = { 
                  startDate: dateStr, 
                  endDate: dateStr, 
                  roomName: roomInfo.roomName,
                  roomId: roomId
                };
                ranges[month].push(currentRange);
              }
            }
          });
        }

        return ranges;
      };

      const processedRanges = await processDates(fetchedDates);
      setGroupedDates(processedRanges);
    }

    processAndSetDates(); // Fetch and process dates
  }, [user]); // Re-run when `user` changes

  return (
    <div className="occupied-dates-container">
      {Object.keys(groupedDates).map((month) => (
        <div key={month} className="month-section">
          <h2 className="month-title">{month}</h2>
          <div className="date-cards">
            {groupedDates[month].map((range, index) => (
              <div key={index} className="date-card">
                <p className="date-range">
                  {new Date(range.startDate).toLocaleDateString("en-GB")}
                  {range.startDate !== range.endDate && ` - ${new Date(range.endDate).toLocaleDateString("en-GB")}`}
                </p>
                <p className="room-name">
                  {range.roomName}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OccupiedDatesDisplay;
