
export default async function Page(
    { params,
    }: {
        params: Promise<{ id: string }>
    }) {

    const { id } = await params
    
    const res = await fetch(`http://127.0.0.1:8000/note/${id}`).then((response) => response.json())
    const data = await res
    // const note = data.note
    console.log(data);
        
    return (

        <div>
            {id}
        </div>
    )
}
