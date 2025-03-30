// import * as React from "react";
// import {Card} from React;
// // import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import UserActivity from "../components/UserActivity";
// import Settings from "../components/Settings";
// import BathroomMap from "../components/BathroomMap";
// import { Ionicons } from "@expo/vector-icons";

// export default function BathroomCard() {

//     const [bio, setBio] = useState({
//         name: "Mascot Name",
//         quote: "Some inspiring quote...",
//         imgSrc: undefined
//     });


//     useEffect(() => {
//         for()
        
//         fetch("https://public-bathrooms.p.rapidapi.com/api/getById?={id", {
//             headers: {
//                 "x-rapidapi-host" : "public-bathrooms.p.rapidapi.com",
//                 "x-rapidapi-key" : "d74c5bf05cmshddf42ab510a1742p11bf65jsne34a4dc30863"
//             }
//         })
//         .then(res => res.json())
//         .then(data => setBio(data))
//     }, []);


//     return (
//         <Card>
//             {
//                 bio.imgSrc ? <Image style={{width: 250, height: 250}} source={{uri: bio.imgSrc}}/> : <></>
//             }
//             <Text style={{fontSize: 48}}>{bio.name}</Text>
//             <Text style={{fontSize: 24}}>{bio.quote}</Text>
//         </Card>

//     );
// }