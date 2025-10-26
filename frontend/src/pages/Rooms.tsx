import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ApiResponse, RoomGetDto} from "../constants/types";
const RoomsPage = () => {
// getter
    //const url = import.meta.env.BASE_URL;
    const [rooms, setRooms] = useState<RoomGetDto[]>();
    const fetchRooms = async () => {
        try {
            const response = await axios.get<RoomGetDto[]>(
                "http://localhost:8000/rooms/" // temp dev url
            );
            setRooms(response.data);
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        }
    };
    useEffect(() => {fetchRooms();}, []);
    return (
        <div>
            <h1>All Rooms</h1>
            <div className='box'>
                <table>
                    <thead>
                        <th scope="col">Name&emsp;</th>
                        <th scope="col">Capacity&emsp;</th>
                    </thead>
                </table>
                <tbody>
                    {rooms ? (
                        rooms?.map((room) => (
                            <tr key={room.id}>  
                                <td>
                                    {room.name}&emsp;
                                </td>
                                <td>
                                    &emsp;{room.capacity}&emsp;
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4}>Loading...</td>
                        </tr>
                    )}   
                </tbody>
            </div>
        </div>
    );
};
export default RoomsPage