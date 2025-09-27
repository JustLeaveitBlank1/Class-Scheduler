import React from 'react'
import BubblyLink from '../components/BubblyLink'
const Home: React.FC = () => {
    return (
        <div className="home">
            {/* header */}
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">
                    Schedulith: course scheduling app.
            </h1>
            {/* buttons */}
            <div className="dash">
                <ul>
                    <li>
                        <BubblyLink to="/courses" bgColor="#4588C4" hoverColor="#085FAE">
                            Courses
                        </BubblyLink>
                    </li>
                    <li>
                        <BubblyLink to="/instructors" bgColor="#FFB54D" hoverColor="#FF9500">
                            Instructors
                        </BubblyLink>
                    </li>
                    <li>
                        <BubblyLink to="/rooms" bgColor="#4BD980" hoverColor="#00BE4D">
                            Rooms
                        </BubblyLink>
                    </li>
                    <li>
                        <BubblyLink to="/schedule" bgColor="#FF7558" hoverColor="#AA4C39">
                            Schedule
                        </BubblyLink>
                    </li>
                </ul>
            </div>
            {/* text caption */}
            <div className="caption">
                
                <p className="text-gray-700 text-lg">
                    Manage courses, instructors, and rooms all in one place.
                </p>
            </div>
        </div>
    );
};
export default Home;