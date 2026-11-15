import { useApp } from '../context/AppContext.jsx'
import WorkTable from '../components/WorkTable.jsx'
import { CATS } from '../services/domain.js'
import { TODAY } from '../services/dates.js'

export default function NewWork() {
  const { s, addWork } = useApp()
  return (
    <>
      <div className="card">
        <h3>Create New Work</h3>
        <div className="row">
          {CATS.map((c) => <button key={c} className="btn s" onClick={() => addWork(TODAY(), c)}>+ {c}</button>)}
        </div>
      </div>
      <div className="card">
        <h3>All Work ({s.works.length})</h3>
        <WorkTable list={s.works} />
      </div>
    </>
  )
}
