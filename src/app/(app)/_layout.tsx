import MaterialIcons from '@react-native-vector-icons/material-icons';
import { router, Stack } from 'expo-router';
import { Pressable, TouchableOpacity } from 'react-native';

const homeHeaderIcon = {
  headerRight: () => (
    <Pressable onPress={() => router.dismissAll()}>
      <MaterialIcons name='home-filled' color={"#FFFFFF"} size={25}/>
    </Pressable>
  ),
}

const notificationHeaderIcon = {
  headerRight: () => (
    <Pressable onPress={() => {}}>
      <MaterialIcons name='notifications-active' color={"#FFFFFF"} size={25}/>
    </Pressable>
  ),
}


export default function AppLayout() {
  // This renders the navigation stack for all authenticated app routes.
  return (
    <Stack
      screenOptions={{ 
        headerStyle: {
          backgroundColor: "#219EBC"
        },
        headerTintColor: "#FFFFFF"
      }}
    >
      <Stack.Screen name="index" options={{title: "Menu", headerTitleAlign: "center"}}/>
      <Stack.Screen name="Therapists/index" 
        options={{
          title: "Terapeutas", 
          headerTitleAlign: "center",
          ...homeHeaderIcon,
        }}
      />
      <Stack.Screen name="Activities/index" 
        options={{
          title: "Atividades", 
          headerTitleAlign: "center",
          ...homeHeaderIcon,
        }}
      />
      <Stack.Screen name="Activities/Activity" 
        options={{
          title: "Atividade", 
          headerTitleAlign: "center",
          ...homeHeaderIcon,
        }}
      />
    </Stack>
  );
};