import React, { useState, useEffect } from 'react'
import './DevicePage.css';
import axios from 'axios';



const APITable = () => {
    const [APIData, setAPIData] = useState([])

    useEffect(() => {

        const fetchData = async () => {
            const response = await axios.get("https://jsonplaceholder.typicode.com/users")
            console.log(response.data)
            setAPIData(response.data)
        }
        fetchData()
    }, [])

    return (
        <>
            <div className="drivers-table-container">
                <table className="drivers-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>name</th>
                            <th>username</th>
                            <th>email</th>
                            <th>phone</th>
                            <th>website</th>
                            <th>street</th>
                            <th>city</th>
                            <th>zipcode</th>

                        </tr>
                    </thead>
                    <tbody>
                        {APIData.map(data => (
                            <tr key={data.id}>
                                <td>{data.id}</td>
                                <td>{data.name}</td>
                                <td>{data.username}</td>
                                <td>{data.email}</td>
                                <td>{data.phone}</td>
                                <td>{data.website}</td>
                                <td>{data.address.street}</td>
                                <td>{data.address.city}</td>
                                <td>{data.address.zipcode}</td>
                               
                            </tr>
                        ))}
                        {APIData.length === 0 && (
                            <tr>
                                <td colSpan="10" className="no-drivers">
                                    {APIData.length === 0
                                        ? 'No drivers added yet'
                                        : 'No drivers match the filter criteria'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div></>
    )
}

export default APITable