import { View, Text, Pressable, TextInput } from "react-native";
import TherapistsList from "./TherapistsList";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons, { MaterialIconsIconName } from "@react-native-vector-icons/material-icons";
import { useEffect, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Link } from "expo-router";
import { useSession } from "@/context/ctx";
import axiosInstance from "@/services/apiConfig";

const StyledPressable = ({title, icon} : {title: string, icon: MaterialIconsIconName}) => (
  <Pressable className="flex flex-row gap-1 p-1 bg-neutral-200 border border-neutral-400 rounded-md">
    <MaterialIcons name={icon} size={20} color={"#000000"}/>
    <Text>{title}</Text>
  </Pressable>
)

type Therapists = {
  _id: string;
  therapist: string;
  therapistDisplayName: string;
  therapistEmail: string;
  status: string;
}

export default function Therapists () {
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const [therapists, setTherapists] = useState<Therapists[]>([]);

  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const getTherapists = async () => {
      try {
        setIsLoading(true);
        //@ts-ignore
        const user_id = JSON.parse(user)._id;

        const { data } = await axiosInstance.get(`/api/get-therapists/${user_id}`, {
          params: {search,},
        });

        console.log(data)
        
        setTherapists(data?.therapists);
      } catch(e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    getTherapists();
  }, [search]);

  return (
    <SafeAreaView>
      <KeyboardAwareScrollView contentContainerClassName="gap-3">

        <View className="p-2">
          <View className="flex-row items-center bg-neutral-200 rounded-full">
            <MaterialIcons name="search" color={"#b0afaf"} size={20} 
              style={{padding: 8, paddingRight: 0}}
            />
            <TextInput
              placeholder="Pesquisar terapeuta pelo nome..."
              value={search}
              onChangeText={(val) => setSearch(val)}
              className="flex-1"
            />
          </View>
        </View>

        {therapists && therapists?.length ? (
          <TherapistsList therapists={therapists} />
        ) : (
          <View className="flex flex-col items-center justify-center gap-3">
            <MaterialIcons 
              name="search-off"
              color={"#b0afaf"} size={60}
            />
            <Text className="text-lg text-neutral-400">Nenhum terapeuta encontrado.</Text>
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}