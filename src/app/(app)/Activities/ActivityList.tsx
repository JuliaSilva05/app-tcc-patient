import { useSession } from "@/context/ctx";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import { SafeAreaView } from "react-native-safe-area-context";
import Moment from 'moment';

type Assignment = {
  _id: string;
}

export default function PatientsList({activities}:{activities: any[]}) {
  const { user } = useSession();
  const user_id = JSON.parse(user)._id
  return (
    <SafeAreaView>
      {activities.map(item => {
        return (
          <>
            <Pressable 
              key={item._id}
              className="flex flex-row mx-2 items-center justify-between border-t border-t-neutral-400"
              onPress={() => {
                
                router.navigate({
                  pathname: "/(app)/Activities/Activity",
                  params: {
                    assignmentId: item._id,
                    patientId: user_id,
                    activityId: item.activity,
                    questionsCount: item.questionsCount,
                  }
                });

              }}
            >
              <View className="flex-1 flex-row items-center gap-3 my-3">
                <View className="w-10 h-10 p-1 items-center justify-center rounded-full border">
                  <MaterialIcons name="person" size={25} />
                </View>
                
                <View className="gap-0">
                  <Text className="text-lg truncate">{item.title}</Text>
                  <View className="flex-1 flex-row justify-between">
                    <Text className="text-sm">
                      <Text className="font-medium">Enviado por: </Text>{item.therapistDisplayName}
                    </Text> 
                    
                  </View>
                </View>
              </View>
            
              <View className="items-end">
                <MaterialIcons name="chevron-right" size={30} />
                <Text className="text-sm">
                  {Moment(item.createdAt).format("DD/MM/YYYY")}
                </Text> 
              </View>
            </Pressable>
          </>
        )
      })}
      
    </SafeAreaView>
  )
}