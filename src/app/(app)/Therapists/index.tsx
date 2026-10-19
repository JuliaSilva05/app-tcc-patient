import { View, Text, Pressable, TextInput } from "react-native";
import TherapistsList from "./TherapistsList";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons, { MaterialIconsIconName } from "@react-native-vector-icons/material-icons";
import { useState } from "react";

const StyledPressable = ({title, icon} : {title: string, icon: MaterialIconsIconName}) => (
  <Pressable className="flex flex-row gap-1 p-1 bg-neutral-200 border border-neutral-400 rounded-md">
    <MaterialIcons name={icon} size={20} color={"#000000"}/>
    <Text>{title}</Text>
  </Pressable>
)

export default function Therapists () {
  const [search, setSearch] = useState("");
  
  return (
    <SafeAreaView className="flex flex-col">
      
      <View className="flex-row justify-around">
        <StyledPressable title="Arquivar" icon="person-remove" />
        <StyledPressable title="Adicionar" icon="person-add" />
      </View>

      <View className="flex-row">
        <MaterialIcons name="search" color={"#b0afaf"} size={20}/>
        <TextInput
          className="bg-neutral-200 border border-neutral-400"
        />
      </View>

      <TherapistsList />
    </SafeAreaView>
  )
}