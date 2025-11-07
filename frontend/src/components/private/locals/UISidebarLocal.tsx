interface BusinessSidebarProps {
  children: React.ReactNode;
}

const BusinessSidebar: React.FC<BusinessSidebarProps> = ({
  children,
}) => {


  return (
    <div className="min-h-screen BGLocal">
      <div>{children}</div>
    </div>
  );
};

export default BusinessSidebar;