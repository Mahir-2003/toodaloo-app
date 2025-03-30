// import * as React from "react";
// import {Card} from React;
// import ENV from "../.env.js";
// import {useState} from React;
// // import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import UserActivity from "./UserActivity";
// import Settings from "./Settings";
// import BathroomMap from "./BathroomMap"
// import { Ionicons } from "@expo/vector-icons";

// export default function BathroomCard() {

//     const [id, setId] = useState({
//         id: 12345
//     });

//     useEffect(() => {
//         fetch(`https://public-bathrooms.p.rapidapi.com/api/getByCords?lat=${latitude}&lng=${longitude}&radius=10&page=1&per_page=10`) ({
//             headers: {
//                 "x-rapidapi-host": ENV.RAPID_API_HOST,
//                 "x-rapidapi-key": ENV.RAPID_API_KEY
//             }
//         })
//         .then(res => res.json())
//         .then(data => setId((data.map(bathroom => bathroom.id))))
//     }, []);


//     return (
//         <Card>
            
//             <Text style={{fontSize: 48}}>{bio.name}</Text>
//             <Text style={{fontSize: 24}}>{bio.quote}</Text>
//         </Card>

//     );
// }