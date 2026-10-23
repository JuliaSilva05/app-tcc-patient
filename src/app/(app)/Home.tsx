import { useSession } from "@/context/ctx";
import MaterialIcons, { MaterialIconsIconName } from "@react-native-vector-icons/material-icons";
import { Link, RelativePathString, router } from "expo-router";
import { View, Text, FlatList, Pressable, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const options = [
  {
    id: "1",
    title: "Terapeutas",
    icon: "supervisor-account",
    link: "/Therapists",
  },
//   {
//     id: "2",
//     title: "Atividades",
//     icon: "add-task",
//     link: "/",
//   },
//   {
//     id: "3",
//     title: "Sequências",
//     icon: "format-list-numbered",
//     link: "/",
//   },
  {
    id: "4",
    title: "Configurações",
    icon: "settings",
    link: "/",
  },
]

function createRows(data: any[], columns: number) {
  const rows = Math.floor(data.length / columns);
  let lastRowElements = data.length - rows * columns; 
  while (lastRowElements !== columns) { 
    data.push({
      empty: true
    });
    lastRowElements += 1;
  }
  return data;
}

const Home = () => {
  const { signOut } = useSession();
  
  return (
    <SafeAreaView>
      <Button title="logout-wip" onPress={() => signOut()} />
      <FlatList 
        data={createRows(options, 2)}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={({item}) => {
          return (
            <Pressable
              className={`basis-0 aspect-square items-center justify-center
                ${!item.empty ? "bg-cyan-600" : "bg-transparent"} rounded-[32px] grow m-3 `}
              onPress={() => router.navigate(item.link || "/")}
            >
              {!item.empty ? (
                <>
                  <MaterialIcons name={item.icon} color={"#FFFFFF"} size={90} />
                  <Text className="text-white text-2xl">{item.title}</Text>
                </>
              ) : null}
            </Pressable>
          )
        }}
      />
    </SafeAreaView>
  )
}

export default Home;