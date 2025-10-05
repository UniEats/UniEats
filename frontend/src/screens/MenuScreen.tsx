import { CommonLayout } from "@/components/CommonLayout/CommonLayout";
import { useMenuList } from "@/services/MenuServices";
import { Menu } from "@/components/Menu/Menu";

export const MenuScreen = () => {
  const menuData = useMenuList();

  return (
    <CommonLayout>
      {menuData.isLoading ? (
        "Loading..."
      ) : !menuData.data ? (
        console.error(menuData),
        "Data load failed"
      ) : (
        <Menu menuSections={menuData.data} />
      )}
    </CommonLayout>
  );
};
