import { Card } from '@/components/ui/card'
import { AppUser } from '@/types/user'
import UsersList from '../UsersList'


type Props = {
    users: AppUser[]
    handleDeleteUser: (targetId: string) => Promise<void>
}

export default function ManagerContent({
    users,
    handleDeleteUser,
}: Props) {
    return (
        <div className="flex flex-col gap-3">
            {users.map((user) => (
                <Card
                    key={user.clerk_user_id}
                    className="relative border hover:border-green-600 transition-all duration-200"
                >
                    <UsersList
                        user={user}
                        handleDeleteUser={handleDeleteUser}
                    />
                </Card>
            ))}
        </div>
    )
}