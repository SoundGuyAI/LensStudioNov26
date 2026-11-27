/**
 * DemoMeshBuilders — MeshBuilder helpers for Zip Zap Zop 3D demo props.
 * Stylized mock actors, energy ball, and pass arrows (vertex-color layout).
 */

export type Rgba = [number, number, number, number]

export function createColoredBuilder(): MeshBuilder {
  const builder = new MeshBuilder([
    {name: "position", components: 3},
    {name: "normal", components: 3, normalized: true},
    {name: "color", components: 4},
  ])
  builder.topology = MeshTopology.Triangles
  builder.indexType = MeshIndexType.UInt16
  return builder
}

/** Box with verified CCW winding (per mesh-builder-scripting primitives). */
export function addBox(
  builder: MeshBuilder,
  indices: number[],
  cx: number,
  cy: number,
  cz: number,
  hw: number,
  hh: number,
  hd: number,
  color: Rgba,
  baseIdx: number,
): number {
  const x0 = cx - hw
  const x1 = cx + hw
  const y0 = cy - hh
  const y1 = cy + hh
  const z0 = cz - hd
  const z1 = cz + hd

  const verts: number[] = []
  let vi = baseIdx

  const face = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number],
    n: [number, number, number],
  ) => {
    verts.push(...p0, ...n, ...color, ...p1, ...n, ...color, ...p2, ...n, ...color, ...p3, ...n, ...color)
    indices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3)
    vi += 4
  }

  face([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0])
  face([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0], [-1, 0, 0])
  face([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0])
  face([x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [0, -1, 0])
  face([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1])
  face([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1])

  builder.appendVerticesInterleaved(verts)
  return vi
}

/** Lathe a [radius, height] profile around +Y (CCW from outside). */
export function buildLathe(
  builder: MeshBuilder,
  profile: [number, number][],
  segments: number,
  color: Rgba,
  baseIdx: number = 0,
): number {
  const P = profile.length
  let vi = baseIdx
  const startIdx = vi
  const indices: number[] = []

  const prof2dN: [number, number][] = []
  for (let j = 0; j < P; j++) {
    const prev = profile[Math.max(0, j - 1)]
    const next = profile[Math.min(P - 1, j + 1)]
    const dx = next[0] - prev[0]
    const dy = next[1] - prev[1]
    const len = Math.hypot(dy, -dx) || 1
    prof2dN.push([dy / len, -dx / len])
  }

  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2
    const c = Math.cos(theta)
    const s = Math.sin(theta)
    for (let j = 0; j < P; j++) {
      const [r, y] = profile[j]
      const [n2x, n2y] = prof2dN[j]
      builder.appendVerticesInterleaved([r * c, y, r * s, n2x * c, n2y, n2x * s, ...color])
      vi++
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < P - 1; j++) {
      const bl = startIdx + i * P + j
      const br = startIdx + i * P + (j + 1)
      const tl = startIdx + (i + 1) * P + j
      const tr = startIdx + (i + 1) * P + (j + 1)
      indices.push(bl, br, tr, bl, tr, tl)
    }
  }

  if (profile[0][0] > 1e-6) {
    const y = profile[0][1]
    const r = profile[0][0]
    const center = vi
    builder.appendVerticesInterleaved([0, y, 0, 0, -1, 0, ...color])
    vi++
    const ring = vi
    for (let i = 0; i <= segments; i++) {
      const th = (i / segments) * Math.PI * 2
      builder.appendVerticesInterleaved([
        r * Math.cos(th),
        y,
        r * Math.sin(th),
        0,
        -1,
        0,
        ...color,
      ])
      vi++
    }
    for (let i = 0; i < segments; i++) {
      indices.push(center, ring + i, ring + i + 1)
    }
  }

  if (profile[P - 1][0] > 1e-6) {
    const y = profile[P - 1][1]
    const r = profile[P - 1][0]
    const center = vi
    builder.appendVerticesInterleaved([0, y, 0, 0, 1, 0, ...color])
    vi++
    const ring = vi
    for (let i = 0; i <= segments; i++) {
      const th = (i / segments) * Math.PI * 2
      builder.appendVerticesInterleaved([
        r * Math.cos(th),
        y,
        r * Math.sin(th),
        0,
        1,
        0,
        ...color,
      ])
      vi++
    }
    for (let i = 0; i < segments; i++) {
      indices.push(center, ring + i + 1, ring + i)
    }
  }

  builder.appendIndices(indices)
  return vi
}

/** Assign mesh + material to a new RenderMeshVisual on `host`. */
export function applyMesh(host: SceneObject, builder: MeshBuilder, material: Material | null): RenderMeshVisual {
  const rmv = host.createComponent("Component.RenderMeshVisual") as RenderMeshVisual
  rmv.mesh = builder.getMesh()
  if (material) {
    rmv.mainMaterial = material
  }
  builder.updateMesh()
  return rmv
}

/**
 * Stylized mock person (~heightCm tall): head + torso + legs + arms.
 * Built in local space with feet near y=0.
 */
export function buildActorMesh(material: Material | null, color: Rgba, heightCm: number): SceneObject {
  const so = global.scene.createSceneObject("MockActor")
  const builder = createColoredBuilder()
  const indices: number[] = []
  let vi = 0

  const s = heightCm / 12
  const headR = 1.15 * s
  const torsoH = 3.6 * s
  const torsoW = 1.35 * s
  const torsoD = 0.85 * s
  const legH = 3.4 * s
  const legW = 0.45 * s
  const armH = 2.8 * s
  const armW = 0.38 * s

  const torsoCy = legH + torsoH * 0.5
  const headCy = legH + torsoH + headR * 0.95

  // Legs
  vi = addBox(builder, indices, -0.55 * s, legH * 0.5, 0, legW, legH * 0.5, legW, color, vi)
  vi = addBox(builder, indices, 0.55 * s, legH * 0.5, 0, legW, legH * 0.5, legW, color, vi)
  // Torso
  vi = addBox(builder, indices, 0, torsoCy, 0, torsoW, torsoH * 0.5, torsoD, color, vi)
  // Arms (slightly forward for "ready to pass" silhouette)
  vi = addBox(
    builder,
    indices,
    -(torsoW + armW),
    torsoCy + 0.3 * s,
    0.35 * s,
    armW,
    armH * 0.5,
    armW,
    color,
    vi,
  )
  vi = addBox(
    builder,
    indices,
    torsoW + armW,
    torsoCy + 0.3 * s,
    0.35 * s,
    armW,
    armH * 0.5,
    armW,
    color,
    vi,
  )
  builder.appendIndices(indices)

  // Head (lathe sphere-ish)
  const headProfile: [number, number][] = []
  const segs = 8
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const ang = Math.PI * t
    headProfile.push([Math.sin(ang) * headR, headCy - headR + (1 - Math.cos(ang)) * headR])
  }
  buildLathe(builder, headProfile, 12, color, builder.getVerticesCount())

  applyMesh(so, builder, material)
  return so
}

/** Compact energy ball (lathe sphere). */
export function buildEnergyBall(material: Material | null, color: Rgba, radiusCm: number): SceneObject {
  const so = global.scene.createSceneObject("EnergyBall")
  const builder = createColoredBuilder()
  const profile: [number, number][] = []
  const segs = 10
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const ang = Math.PI * t
    profile.push([Math.sin(ang) * radiusCm, -radiusCm + (1 - Math.cos(ang)) * radiusCm])
  }
  buildLathe(builder, profile, 14, color, 0)
  applyMesh(so, builder, material)
  return so
}

/**
 * Pass arrow along +Z (shaft + tip). Length ≈ lengthCm.
 * Orient with quat.lookAt(passDir, up) so local +Z aligns with pass direction.
 */
export function buildPassArrow(material: Material | null, color: Rgba, lengthCm: number): SceneObject {
  const so = global.scene.createSceneObject("PassArrow")
  const builder = createColoredBuilder()
  const indices: number[] = []
  let vi = 0

  const shaftLen = lengthCm * 0.62
  const tipLen = lengthCm * 0.38
  const shaftHalf = 0.22
  const tipHalfBase = 0.55

  const shaftCz = shaftLen * 0.5
  vi = addBox(builder, indices, 0, 0, shaftCz, shaftHalf, shaftHalf, shaftLen * 0.5, color, vi)
  builder.appendIndices(indices)

  const tipStart = shaftLen
  const tipEnd = tipStart + tipLen
  const hb = tipHalfBase
  const tipVerts: number[] = []
  const tipIdx: number[] = []
  let tvi = builder.getVerticesCount()

  const tipFace = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
  ) => {
    const ax = p1[0] - p0[0]
    const ay = p1[1] - p0[1]
    const az = p1[2] - p0[2]
    const bx = p2[0] - p0[0]
    const by = p2[1] - p0[1]
    const bz = p2[2] - p0[2]
    let nx = ay * bz - az * by
    let ny = az * bx - ax * bz
    let nz = ax * by - ay * bx
    const len = Math.hypot(nx, ny, nz) || 1
    nx /= len
    ny /= len
    nz /= len
    tipVerts.push(...p0, nx, ny, nz, ...color, ...p1, nx, ny, nz, ...color, ...p2, nx, ny, nz, ...color)
    tipIdx.push(tvi, tvi + 1, tvi + 2)
    tvi += 3
  }

  const apex: [number, number, number] = [0, 0, tipEnd]
  const b0: [number, number, number] = [hb, hb, tipStart]
  const b1: [number, number, number] = [-hb, hb, tipStart]
  const b2: [number, number, number] = [-hb, -hb, tipStart]
  const b3: [number, number, number] = [hb, -hb, tipStart]
  tipFace(b0, b1, apex)
  tipFace(b1, b2, apex)
  tipFace(b2, b3, apex)
  tipFace(b3, b0, apex)
  // Base cap facing -Z (CCW from outside)
  tipFace(b0, b1, b2)
  tipFace(b0, b2, b3)

  builder.appendVerticesInterleaved(tipVerts)
  builder.appendIndices(tipIdx)

  applyMesh(so, builder, material)
  return so
}
